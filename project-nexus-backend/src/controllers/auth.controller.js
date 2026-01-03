import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Campus from "../models/Campus.model.js";
import EmailVerification from "../models/EmailVerification.model.js";
import PasswordReset from "../models/PasswordReset.model.js";
import { sendVerificationCode, sendPasswordResetCode } from "../config/email.js";
import { isAdminEmail } from "../config/admins.js";

// Request verification code
export const requestVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Basic Validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // 3. Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Set expiration (10 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // 5. Delete any existing verification codes for this email
        await EmailVerification.deleteMany({ email: normalizedEmail });

        // 6. Save verification code
        const emailVerification = new EmailVerification({
            email: normalizedEmail,
            code,
            expiresAt,
        });
        await emailVerification.save();

        // 7. Send verification code via email
        try {
            await sendVerificationCode(normalizedEmail, code);
            res.json({
                message: "Verification code sent to your email",
                email: normalizedEmail,
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // Delete the verification code if email fails
            await EmailVerification.deleteOne({ email: normalizedEmail });
            return res.status(500).json({
                message: "Failed to send verification email. Please try again later.",
            });
        }
    } catch (error) {
        console.error("Request Verification Code Error:", error);
        res.status(500).json({ message: "Server error while requesting verification code" });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role, campusId, verificationCode } = req.body;

        // 1. Basic Validation
        if (!name || !email || !password || !verificationCode) {
            return res.status(400).json({
                message: "Name, email, password, and verification code are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const isAdmin = isAdminEmail(normalizedEmail);

        // 2. For non-admin users, campusId is required
        if (!isAdmin && !campusId) {
            return res.status(400).json({ message: "Campus selection is required" });
        }

        // 3. Verify email verification code
        const emailVerification = await EmailVerification.findOne({
            email: normalizedEmail,
            code: verificationCode,
            verified: false,
        });

        if (!emailVerification) {
            return res.status(400).json({
                message: "Invalid or expired verification code",
            });
        }

        // Check if code has expired
        if (new Date() > emailVerification.expiresAt) {
            await EmailVerification.deleteOne({ _id: emailVerification._id });
            return res.status(400).json({
                message: "Verification code has expired. Please request a new one.",
            });
        }

        // 4. Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 5. For admin users, skip campus validation
        let campus = null;
        let userRole = role || "student";
        let finalCampusId = null;

        if (isAdmin) {
            // Admin users get super_admin role and no campus
            userRole = "super_admin";
        } else {
            // For non-admin users, validate campus
            campus = await Campus.findById(campusId);
            if (!campus) {
                return res.status(400).json({ message: "Invalid campus selected" });
            }

            const emailDomain = normalizedEmail.split("@")[1];
            if (emailDomain !== campus.emailDomain) {
                return res.status(400).json({
                    message: `Email must belong to ${campus.emailDomain} for ${campus.name}`,
                });
            }
            finalCampusId = campus._id;
        }

        // 6. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 7. Create user
        const newUser = new User({
            name,
            email: normalizedEmail,
            passwordHash,
            role: userRole,
            campusId: finalCampusId,
        });

        await newUser.save();

        // 8. Mark verification code as used
        emailVerification.verified = true;
        await emailVerification.save();

        // 9. Respond
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                campus: campus ? campus.name : null,
            },
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.passwordHash) {
            return res.status(401).json({ 
                message: "This account was created with Google OAuth. Please sign in with Google." 
            });
        }

        // 3. Compare Password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate Token
        const payload = {
            userId: user._id,
            campusId: user.campusId,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        // 5. Response
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                campusId: user.campusId,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// Request password reset code
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Basic Validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                message: "If an account exists with this email, a password reset code has been sent.",
            });
        }

        // 3. Check if user has a password (not OAuth-only account)
        if (!user.passwordHash) {
            return res.status(400).json({
                message: "This account was created with Google OAuth. Please sign in with Google.",
            });
        }

        // 4. Generate 6-digit reset code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 5. Set expiration (15 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // 6. Delete any existing reset codes for this email
        await PasswordReset.deleteMany({ email: normalizedEmail });

        // 7. Save reset code
        const passwordReset = new PasswordReset({
            email: normalizedEmail,
            code,
            expiresAt,
        });
        await passwordReset.save();

        // 8. Send reset code via email
        try {
            await sendPasswordResetCode(normalizedEmail, code);
            res.json({
                message: "If an account exists with this email, a password reset code has been sent.",
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // Delete the reset code if email fails
            await PasswordReset.deleteOne({ email: normalizedEmail });
            return res.status(500).json({
                message: "Failed to send password reset email. Please try again later.",
            });
        }
    } catch (error) {
        console.error("Request Password Reset Error:", error);
        res.status(500).json({ message: "Server error while requesting password reset" });
    }
};

// Reset password with verification code
export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // 1. Basic Validation
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                message: "Email, verification code, and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Verify reset code
        const passwordReset = await PasswordReset.findOne({
            email: normalizedEmail,
            code,
            used: false,
        });

        if (!passwordReset) {
            return res.status(400).json({
                message: "Invalid or expired reset code",
            });
        }

        // Check if code has expired
        if (new Date() > passwordReset.expiresAt) {
            await PasswordReset.deleteOne({ _id: passwordReset._id });
            return res.status(400).json({
                message: "Reset code has expired. Please request a new one.",
            });
        }

        // 3. Find user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 4. Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 5. Update user password
        user.passwordHash = passwordHash;
        await user.save();

        // 6. Mark reset code as used
        passwordReset.used = true;
        await passwordReset.save();

        // 7. Respond
        res.json({
            message: "Password reset successfully. Please login with your new password.",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server error during password reset" });
    }
};
