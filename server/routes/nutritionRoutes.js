import express from "express";
import { getTargets } from "../controllers/nutritionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTargets);
router.get("/targets", authMiddleware, getTargets);

export default router;
