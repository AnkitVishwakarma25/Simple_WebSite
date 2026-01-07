
import mongoose from "mongoose";

const authSecuritySchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,

    },
    loginAttempts: {
        type: Number,
        default: 0,

    },
    lockUntil: {
        type: Date,
    },

    lastFailedAt: {
        type: Date,
    },


}, { timestamps: true });



authSecuritySchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

authSecuritySchema.methods.incrementAttempts = async function () {
    this.loginAttempts += 1;
    this.lastFailedAt = new Date();

    if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.save();
};

authSecuritySchema.methods.resetAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.lastFailedAt = undefined;
    await this.save();
};


const AuthSecurity = mongoose.model("AuthSecurity", authSecuritySchema);

export default AuthSecurity;
