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
            required: function() {
                try {
                    return !(this.$locals && this.$locals.isOAuthUser);
                } catch (e) {
                    return true;
                }
            },
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

userSchema.pre("save", async function() {
    if (this.$locals && this.$locals.isOAuthUser) {
        if (!this.passwordHash || this.passwordHash === null || this.passwordHash === undefined || this.passwordHash === "") {
            if (this.isNew) {
                delete this.passwordHash;
            } else {
                this.$unset = this.$unset || {};
                this.$unset.passwordHash = "";
            }
        }
    }
});

const User = mongoose.model("User", userSchema);

export default User;
