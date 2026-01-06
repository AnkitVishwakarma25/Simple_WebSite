import jwt from "jsonwebtoken";

import config from "../config/configenv.js";
import redisClient from "../config/redis.js";
import { generateAccessToken } from "../utils/token.js";


export const refreshAccessToken = async (req, res) => {


    try {

        const token = req.cookies.refreshToken;
        const sessionId = req.cookies.sessionId

        if (!token || !sessionId) {

            return res.status(401).json({ message: "Refresh token missing" });
        }

        const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);

        const storedToken = await redisClient.get(`refresh_${decoded.id}:${sessionId}`);

        if (!storedToken || storedToken !== token) {

            return res.status(403).json({ message: "Invalid refreshToken" })
        }

        const newAccessToken = await generateAccessToken({ _id: decoded.id });

        res.json({ accessToken: newAccessToken, message: "accessToken Created " });

    } catch (error) {

        return res.status(401).json({
            message: "Invalid refreshToken "
        })
    }

}