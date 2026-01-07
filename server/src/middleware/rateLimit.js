
import rateLimit from "express-rate-limit"

export const loginRateLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,   // 15m
    max: 5, //attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Try again later.",
    },

});


