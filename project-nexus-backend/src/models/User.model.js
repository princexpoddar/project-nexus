import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["student", "club_admin", "campus_admin", "super_admin"],
            default: "student",
            required: true,
        },
        campusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campus",
            required: function () {
                return this.role !== "super_admin";
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;
