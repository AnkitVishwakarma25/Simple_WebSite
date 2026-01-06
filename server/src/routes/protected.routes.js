
import express from "express"

import { authGuard } from "../middleware/auth.middleware.js"
import { logoutAlldevice } from "../controllers/auth.controller.js";
import { listActiveDevices } from "../controllers/listActiveDevice.controller.js";


const router = express.Router();

router.get("/dashboard", authGuard, (req, res) => {

    res.json({
        message: "Welcome to dashboard",
        user: req.user,
    });
})

router.post("/logoutAll", authGuard, logoutAlldevice)

router.get("/sessions", authGuard, listActiveDevices);


export default router;