import express from "express";
import { register, login, requestVerificationCode, requestPasswordReset, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/request-verification-code", requestVerificationCode);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
