import express from "express";
import { getAllCampuses } from "../controllers/campus.controller.js";

const router = express.Router();

router.get("/", getAllCampuses);

export default router;
