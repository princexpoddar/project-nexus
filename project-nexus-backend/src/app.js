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

export default app;
