

import express from "express"

import { register, login, logout, varifyEmail, checkUsername, completeProfile } from "../controllers/auth.controller.js"
import { refreshAccessToken } from "../controllers/auth.refreshcontroller.js";
import { loginRateLimiter } from "../middleware/rateLimit.js";
import { forgetPassword, resetPassword, verifyOtp } from "../controllers/auth.passwordOperations.js";

const router = express.Router();

router.post("/register", register);
router.post("/varifyemail", varifyEmail);
router.get("/checkusername", checkUsername);
router.post("/completeprofile", completeProfile);

router.post("/login", loginRateLimiter, login);


router.post("/refresh", refreshAccessToken);

router.post('/logout', logout)


router.post("/forgot-password", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;