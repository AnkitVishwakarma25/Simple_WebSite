
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

export const loginRateLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,   // 15m
    max: 10, //attempts
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    message: {
        message: "Too many login attempts. Try again later.",
    },

});




