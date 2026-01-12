import mongoose from "mongoose";

import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {


        username: {
            type: String,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
            sparse: true,
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

            minlength: 8,
            select: false, // IMPORTANT
        },
        isProfileCompleted: {
            type: Boolean,
            default: false,
        },
        isEmailVerified: {
            type: Boolean,

            default: false,
        }
        ,

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


//  HASH PASSWORD BEFORE SAVE

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});


// compare password with user hash password 

userSchema.methods.comparePassword = async function (enteredPassword) {

    return bcrypt.compare(enteredPassword, this.password);
}


const User = mongoose.model("User", userSchema);

export default User;