
import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,

    },

    otp: {
        type: String,
        required: true,

    },
    attempts: {

        type: Number,
        default: 0,
    },
    resendAfter: {
        type: Date,

    },
    expiresAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true })

// Auto-delete expired OTP
emailVerificationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);


export default mongoose.model(
    "EmailVerification",
    emailVerificationSchema
);
