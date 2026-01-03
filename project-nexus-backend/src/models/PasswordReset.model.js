import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
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
        used: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
passwordResetSchema.index({ email: 1, used: 1 });

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;

