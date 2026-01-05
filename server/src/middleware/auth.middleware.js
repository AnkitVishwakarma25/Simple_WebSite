
import jwt from "jsonwebtoken"

import config from "../config/configenv.js"

export const authGuard = (req, res, next) => {


    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const token = authHeader.split(" ")[1];

        const decode = jwt.verify(token, config.JWT_ACCESS_SECRET)

        req.user = decode;

        next();



    } catch (error) {


        return res.status(401).json({

            message: "Invalid or expired token"

        })

    }

}

