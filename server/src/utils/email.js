

import nodemailer from "nodemailer";

import config from "../config/configenv.js";

export const sendOtpEmail = async (to, otp, info) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASS,
        }
    })

    await transporter.sendMail({

        from: `"Security" <${config.EMAIL_USER}>`,
        to,
        subject: `${info}`,
        html: `
        <h3>${info}</h3>
        <p>Your otp is :</p>
        <h2> ${otp}</h2>
        <p>This OTP expires in 10 minutes.</p>

     `

    })

}