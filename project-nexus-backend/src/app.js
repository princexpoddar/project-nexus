import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import campusRoutes from "./routes/campus.routes.js";
import googleAuthRoutes from "./routes/googleAuth.routes.js";
import passport from "./config/passport.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/campuses", campusRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", project: "project-nexus" });
});

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handler middleware - must be last
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export default app;
