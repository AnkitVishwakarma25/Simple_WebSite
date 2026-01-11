
import User from "../models/User.js";

import PasswordReset from "../models/PasswordReset.js";

import { generateOtp } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";

import redisClient from "../config/redis.js";


export const forgetPassword = async (req, res) => {

    const { email } = req.body;

    const now = Date.now();
    const existing = await PasswordReset.findOne({ email });


    if (existing && existing.resendAfter && existing.resendAfter > now) {

        return res.status(429).json({
            message: "Please wait before requesting another OTP",
            resendAfter: existing.resendAfter,
        });
    }

    const user = await User.findOne({ email });

    if (!user) {

        return res.status(400).json({
            message: "User not exists!"
        })
    }



    const otp = generateOtp();

    await PasswordReset.findOneAndUpdate(
        { email },
        {
            otp,
            attempts: 0,
            lockedUntil: undefined,
            resendAfter: new Date(now + 60 * 1000), // ⏳ 60 sec
            expiresAt: new Date(now + 10 * 60 * 1000),
        },
        { upsert: true }
    );

    const subject = "Email Verification"

    await sendOtpEmail(email, otp, subject);

    res.json({
        message: "OTP sent successfully",
        resendAfter: new Date(now + 60 * 1000),
    });



}


export const verifyOtp = async (req, res) => {

    const MAX_OTP_ATTEMPTS = 5;
    const OTP_LOCK_TIME = 10 * 60 * 1000; // 10 minutes


    const { email, otp } = req.body;


    const record = await PasswordReset.findOne({ email });

    if (!record) {

        return res.status(400).json({
            verified: false,
            message: "OTP expired or invalid",
        });
    }

    if (record.lockUntil && record.lockUntil > Date.now()) {

        return res.status(429).json({
            verified: false,
            message: "Too many OTP attempts. Try again later.",
            lockedUntil: record.lockUntil,
        });
    }

    //wrong otp

    if (record.otp !== otp) {

        record.attempts += 1;

        //  Lock OTP after max attempts

        if (record.attempts >= MAX_OTP_ATTEMPTS) {
            record.lockUntil = new Date(Date.now() + OTP_LOCK_TIME);
        }

        await record.save();

        return res.status(400).json({
            verified: false,
            message: "Invalid OTP",
            remainingAttempts: Math.max(
                0,
                MAX_OTP_ATTEMPTS - record.attempts
            ),
        });


    }

    record.attempts = 0;
    record.lockUntil = undefined;

    await record.save();

    res.json({
        verified: true,
        message: "OTP verified successfully",
    });



}







export const resetPassword = async (req, res) => {

    const { email, newPassword } = req.body;

    const record = await PasswordReset.findOne({ email });

    if (!record) {

        return res.status(400).json({ message: "OTP verification required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid request" });
    }

    user.password = newPassword;

    await user.save();

    await PasswordReset.deleteOne({ email });

    // Logout from all devices
    const keys = await redisClient.keys(`refresh_${user._id}:*`);
    if (keys.length) await redisClient.del(keys);

    res.json({
        message: "Password reset successful. Please login again.",
    });

}