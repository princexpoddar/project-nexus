import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Campus from "../models/Campus.model.js";
import { isAdminEmail } from "../config/admins.js";

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

const redirectToError = (res, message) => {
    const errorUrl = new URL(`${getFrontendUrl()}/auth/error`);
    errorUrl.searchParams.set("error", message);
    return res.redirect(errorUrl.toString());
};

export const googleCallbackHandler = async (req, res) => {
    try {
        if (!req.user) {
            return redirectToError(res, "Google authentication failed. Please try again.");
        }

        const googleProfile = req.user;
        
        if (!googleProfile?.emails?.[0]?.value) {
            return redirectToError(res, "Invalid Google profile data. Email is required.");
        }

        const email = googleProfile.emails[0].value;
        const normalizedEmail = email.toLowerCase().trim();
        const name = googleProfile.displayName || normalizedEmail.split("@")[0];

        const isAdmin = isAdminEmail(normalizedEmail);
        let campus = null;
        let userRole = "student";
        let campusId = null;

        // For admin users, skip campus validation
        if (isAdmin) {
            userRole = "super_admin";
        } else {
            // For non-admin users, validate campus
            const emailDomain = normalizedEmail.split("@")[1];
            campus = await Campus.findOne({ emailDomain });

            if (!campus) {
                return redirectToError(res, "Your email domain is not registered with any campus.");
            }
            campusId = campus._id;
        }

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            const userData = {
                name,
                email: normalizedEmail,
                role: userRole,
                campusId: campusId,
            };
            
            user = new User(userData);
            user.$locals = user.$locals || {};
            user.$locals.isOAuthUser = true;
            await user.save();
        } else {
            // Update existing user's role if they're now an admin
            if (isAdmin && user.role !== "super_admin") {
                user.role = "super_admin";
                user.campusId = null;
                await user.save();
            }
        }

        const payload = {
            userId: user._id,
            campusId: user.campusId || null,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        const redirectUrl = new URL(`${getFrontendUrl()}/auth/callback`);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("user", JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            campusId: user.campusId,
        }));

        res.redirect(redirectUrl.toString());

    } catch (error) {
        console.error("Google Auth Error:", error);
        return redirectToError(res, error.message || "Server error during Google login");
    }
};
