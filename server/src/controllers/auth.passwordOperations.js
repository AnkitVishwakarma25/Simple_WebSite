
import User from "../models/User.js";

import PasswordReset from "../models/PasswordReset.js";

import { generateOtp } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";

import redisClient from "../config/redis.js";


export const forgetPassword = async (req, res) => {

    const { email } = req.body;

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
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),

        },
        { upsert: true }

    );

    const subject = "Email Verification"

    await sendOtpEmail(email, otp, subject);
    res.json({ message: "OTP sent to email" });




}


export const verifyOtp = async (req, res) => {

    const { email, otp } = req.body;


    const record = await PasswordReset.findOne({ email, otp })

    if (!record || record.expiresAt < Date.now()) {

        return res.status(400).json({
            verified: false,
            message: "Invalid or expired OTP",
        });
    }

    res.json({
        verified: true,
        message: "OTP verified",
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