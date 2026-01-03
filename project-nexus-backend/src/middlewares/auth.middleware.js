import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains userId, campusId, role
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

export const authorizeCampus = (req, res, next) => {
    // 1. Skip check for super_admin
    if (req.user.role === "super_admin") {
        return next();
    }

    // 2. If route has :campusId param, verify match
    const routeCampusId = req.params.campusId || req.body.campusId;

    if (routeCampusId) {
        if (routeCampusId !== req.user.campusId) {
            return res.status(403).json({ message: "Access to this campus is restricted" });
        }
    }

    // 3. (Implicit isolation) Controllers should always use req.user.campusId for queries
    next();
};
