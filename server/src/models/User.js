import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {


        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false, // IMPORTANT
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },



    }, { timestamps: true, })

const User = mongoose.model("User", userSchema);

export default User;