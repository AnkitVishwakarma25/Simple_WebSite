import jwt from "jsonwebtoken";
import config from "../config/configenv.js";
import redisClient from "../config/redis.js";
import { generateAccessToken } from "../utils/token.js";

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const sessionId = req.cookies.sessionId;

        // 1️⃣ Check cookies
        if (!refreshToken || !sessionId) {
            return res.status(401).json({
                message: "Refresh token or session missing",
            });
        }

        // 2️⃣ Verify refresh token signature
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

        // 3️⃣ Get session from Redis
        const session = await redisClient.get(
            `refresh_${decoded.id}:${sessionId}`
        );

        if (!session) {
            return res.status(403).json({
                message: "Session expired or invalid",
            });
        }

        // 4️⃣ Parse session JSON
        const sessionData = JSON.parse(session);

        // 5️⃣ Compare refresh tokens
        if (sessionData.refreshToken !== refreshToken) {
            return res.status(403).json({
                message: "Refresh token mismatch",
            });
        }

        // 6️⃣ Generate new access token
        const newAccessToken = await generateAccessToken({ _id: decoded.id });

        res.status(200).json({
            message: "New access token generated",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
        });
    }
};
