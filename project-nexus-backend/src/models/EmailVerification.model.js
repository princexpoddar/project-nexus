import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
emailVerificationSchema.index({ email: 1, verified: 1 });

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);

export default EmailVerification;

