

import express from "express"

import { register, login, logout } from "../controllers/auth.controller.js"
import { refreshAccessToken } from "../controllers/auth.refreshcontroller.js";
import { loginRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", loginRateLimiter, login);


router.post("/refresh", refreshAccessToken);

router.post('/logout', logout)

export default router;