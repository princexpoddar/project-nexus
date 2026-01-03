import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import campusRoutes from "./routes/campus.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/campuses", campusRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", project: "project-nexus" });
});

export default app;
