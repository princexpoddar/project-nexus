import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("Email service configuration error:", error);
    } else {
        console.log("Email service is ready to send emails");
    }
});

export const sendVerificationCode = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Project Nexus - Email Verification Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Thank you for registering with Project Nexus!</p>
                <p>Your verification code is:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Project Nexus Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
};

export const sendPasswordResetCode = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Project Nexus - Password Reset Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested to reset your password for your Project Nexus account.</p>
                <p>Your password reset code is:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p><strong>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</strong></p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Project Nexus Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

export default transporter;

