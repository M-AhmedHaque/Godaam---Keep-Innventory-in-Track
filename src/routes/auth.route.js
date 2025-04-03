import express from "express";
import { login,register,refreshToken } from "../controller/auth.controller.js";
import { logout } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;