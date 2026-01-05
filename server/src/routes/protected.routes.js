
import express from "express"

import { authGuard } from "../middleware/auth.middleware.js"


const router = express.Router();

router.get("/dashboard", authGuard, (req, res) => {

    res.json({
        message: "Welcome to dashboard",
        user: req.user,
    });
})

export default router;