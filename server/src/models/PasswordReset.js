import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true,
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Auto-delete expired OTPs
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PasswordReset", passwordResetSchema);

