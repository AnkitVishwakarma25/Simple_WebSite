

import jwt from "jsonwebtoken";

import config from "../config/configenv.js";

export const generateAccessToken = (userId) => {

    return jwt.sign(
        { id: userId },
        config.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );
};
