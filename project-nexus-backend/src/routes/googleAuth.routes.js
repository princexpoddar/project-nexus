import express from "express";
import passport from "passport";
import { googleCallbackHandler } from "../controllers/googleAuth.controller.js";

const router = express.Router();

// @route   GET /auth/google
// @desc    Initiate Google OAuth
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route   GET /auth/google/callback
// @desc    Handle Google Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    googleCallbackHandler
);

export default router;
