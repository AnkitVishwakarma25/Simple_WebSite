
import jwt from "jsonwebtoken"

import config from "../config/configenv.js"


export const generateAccessToken = async (user) => {

    return jwt.sign({
        id: user._id,
        role: user.role,
    },
        config.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    )

}

export const generateRefreshToken = async (user) => {

    return jwt.sign({
        id: user._id,

    },
        config.JWT_REFRESH_SECRET,
        { expiresIn: "7d", })

}