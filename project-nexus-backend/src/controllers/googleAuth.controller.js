import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Campus from "../models/Campus.model.js";

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
        const name = googleProfile.displayName || email.split("@")[0];

        const emailDomain = email.split("@")[1];
        const campus = await Campus.findOne({ emailDomain });

        if (!campus) {
            return redirectToError(res, "Your email domain is not registered with any campus.");
        }

        let user = await User.findOne({ email });

        if (!user) {
            const userData = {
                name,
                email,
                role: "student",
                campusId: campus._id,
            };
            
            user = new User(userData);
            user.$locals = user.$locals || {};
            user.$locals.isOAuthUser = true;
            await user.save();
        }

        const payload = {
            userId: user._id,
            campusId: user.campusId,
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
