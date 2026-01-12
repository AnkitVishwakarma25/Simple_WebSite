

import User from "../models/User.js";
import AuthSecurity from "../models/AuthSecurity.js";
import jwt from "jsonwebtoken"
import config from "../config/configenv.js";
import { v4 as uuidv4 } from "uuid"

import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

import redisClient from "../config/redis.js";

import EmailVerification from "../models/EmailVerification.js";
import { generateOtp } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";


// register codes 

export const register = async (req, res) => {
    try {
        const RESEND_COOLDOWN = 60 * 1000; // 60 sec
        const MAX_DAILY_RESENDS = 10;

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email required",
            });
        }

        const now = Date.now();
        const today = new Date().toISOString().slice(0, 10);

        // 🔍 Find user (if exists)
        let user = await User.findOne({ email });

        // 🚫 If already verified → block re-register
        if (user && user.isEmailVerified) {
            return res.status(400).json({
                message: "Email already registered. Please login.",
            });
        }

        // 🆕 Create user if not exists
        if (!user) {
            user = await User.create({
                email,
                isEmailVerified: false,
                isProfileCompleted: false,
            });
        }

        // 🔐 Handle email verification OTP record
        let record = await EmailVerification.findOne({
            userId: user._id,
        });

        // 🔁 Reset daily resend count if date changed
        if (record && record.resendDate !== today) {
            record.resendDate = today;
            record.resendCount = 0;
            await record.save();
        }

        // ⛔ Daily resend limit
        if (record && record.resendCount >= MAX_DAILY_RESENDS) {
            return res.status(429).json({
                message:
                    "Maximum verification attempts reached for today. Try again tomorrow.",
                retryAfter: "tomorrow",
            });
        }

        // ⏳ Cooldown check
        if (record && record.resendAfter && record.resendAfter > now) {
            return res.status(429).json({
                message: "Please wait before requesting another OTP",
                resendAfter: record.resendAfter,
            });
        }

        // 🔢 Generate OTP
        const otp = generateOtp();

        // 📝 Create / update verification record
        record = await EmailVerification.findOneAndUpdate(
            { userId: user._id },
            {
                otp,
                resendAfter: new Date(now + RESEND_COOLDOWN),
                resendDate: today,
                $inc: { resendCount: 1 },
                expiresAt: new Date(now + 10 * 60 * 1000),
            },
            { upsert: true, new: true }
        );

        // 📧 Send email
        await sendOtpEmail(email, otp, "Verify your email");

        res.status(200).json({
            message: "OTP sent to email",
            resendAfter: record.resendAfter,
            remainingToday: MAX_DAILY_RESENDS - record.resendCount,
        });
    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }
};


export const varifyEmail = async (req, res) => {
    try {

        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        const record = await EmailVerification.findOne({ userId: user._id });

        if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isEmailVerified = true;
        await user.save();

        await EmailVerification.deleteOne({ userId: user._id });

        res.json({
            message: "Email verified",
            next: "SETUP_PROFILE", // 🔥 frontend signal
        });
    } catch (error) {

        console.log(error.message);


        res.status(500).json({ message: "Internal Server Error" })

    }


}


export const checkUsername = async (req, res) => {

    try {
        const { username } = req.query;

        if (!username || username.length < 4) {

            return res.json({ available: false });
        }

        const exists = await User.findOne({ username });


        res.json({

            available: !exists,
        })
    } catch (error) {

        res.status(500).json({ message: "Something Wrong!" })

    }

}

export const completeProfile = async (req, res) => {

    const { email, username, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isEmailVerified) {
        return res.status(403).json({
            message: "Email not verified",
        });
    }

    if (user.isProfileCompleted) {
        return res.status(400).json({
            message: "Profile already completed",
        });
    }

    const usernameExists = await User.exists({ username });

    if (usernameExists) {
        return res.status(409).json({
            message: "Username already taken",
        });
    }

    user.username = username;
    user.password = password; // hashed via pre-save
    user.isProfileCompleted = true;
    await user.save();

    res.json({
        message: "Profile completed successfully",
    });

}




// login codes

export const login = async (req, res) => {


    try {

        const { identifier, password } = req.body;

        //validate input 

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Identifier and password are required",
            });
        }

        //find user by email or username


        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() },
            { username: identifier },
            ]
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        if (!user.isProfileCompleted) {
            return res.status(403).json({
                message: "Please complete your profile",
            });
        }

        let security = await AuthSecurity.findOne({ userId: user._id });


        if (!security) {
            security = await AuthSecurity.create({ userId: user._id });
        }

        if (security.isLocked()) {

            const unlockTime = security.lockUntil;
            return res.status(423).json({

                message: "Your account is temporarily locked due to multiple failed login attempts.",
                locked: true,
                unlockAt: unlockTime,
            });
        }

        // compare password 


        const isMatch = await user.comparePassword(password);



        if (!isMatch) {

            await security.incrementAttempts();  //increament login attempts in authsecurity

            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const sessionId = uuidv4();
        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

        // console.log(accessToken)
        // console.log(refreshToken)


        const sessionData = {
            refreshToken,
            loginAt: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.headers["user-agent"] || "unknown",
        }

        //save refresh token inside redis 

        await redisClient.set(`refresh_${user._id}:${sessionId}`,
            JSON.stringify(sessionData), {
            EX: 7 * 24 * 60 * 60, //7 days 
        })

        // send refresh token inside cookies 

        res.cookie("refreshToken", refreshToken, {

            httpOnly: true,
            secure: false,
            samesite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,

        });

        //send sessionId 

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })





        // 4️⃣ Login success 
        res.status(200).json({
            message: "Login successful",
            accessToken,
            sessionId,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

        await security.resetAttempts();


    } catch (error) {

        res.status(500).json({
            message: "Login failed",
            error: error.message,
        })
    }

}



//logout codes

export const logout = async (req, res) => {

    try {
        const token = req.cookies.refreshToken;
        const sessionId = req.cookies.sessionId;

        if (token && sessionId) {
            const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET)
            await redisClient.del(`refresh_${decoded.id}:${sessionId}`)
        } else {
            return res.json({ message: "Invalid Tokens" })
        }

        res.clearCookie("refreshToken");
        res.clearCookie("sessionId")
        res.json({ message: "Logout from this device successfuly" })

    } catch (error) {

        return res.status(500).json({ message: " Something went wrong" })

    }

}

// logout form all devices

export const logoutAlldevice = async (req, res) => {

    try {
        const userId = req.user.id;

        //find all sessions in redis

        const keys = await redisClient.keys(`refresh_${userId}:*`);

        if (keys.length > 0) {
            await redisClient.del(keys);
        }


        res.clearCookie("refreshToken");
        res.clearCookie("sessionId");

        res.json({ message: "Logged out from all devices" });
    } catch (error) {

        res.status(500).json({
            message: "Internal Server Error!"
        })

    }
}