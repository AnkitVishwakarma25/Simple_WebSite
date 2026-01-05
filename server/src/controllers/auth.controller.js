

import User from "../models/User.js";
import jwt from "jsonwebtoken"
import config from "../config/configenv.js";

import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

import redisClient from "../config/redis.js";


// register codes 

export const register = async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // check all field are there 

        if (!username || !email || !password) {

            return res.status(400).json({
                message: "All field Required !"

            });
        };

        // check user already not exist

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {

            return res.status(409).json({
                message: "User already exists",
            });
        }

        // Create user (password hashing happens in model)

        const user = await User.create({
            username,
            email,
            password,
        });


        // sending a safe response 


        res.status(201).json({

            message: "user registered successfully",

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            }
        })





    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }


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

        // compare password 


        const isMatch = await user.comparePassword(password);



        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

        console.log(accessToken)
        console.log(refreshToken)

        //save refresh token inside redis 

        await redisClient.set(`refresh_${user._id}`,
            refreshToken, {
            EX: 7 * 24 * 60 * 60, //7 days 
        })

        // set refresh token inside cookies 

        res.cookie("refreshToken", refreshToken, {

            httpOnly: true,
            secure: false,
            samesite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,

        });







        // 4️⃣ Login success 
        res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

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

        if (token) {
            const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET)
            await redisClient.del(`refresh_${decoded.id}`)
        } else {
            return res.json({ message: "Invalid Tokens" })
        }

        res.clearCookie("refreshToken");
        res.json({ message: "Logout successfuly" })

    } catch (error) {

        return res.status(500).json({ message: " Something went wrong" })

    }

}
