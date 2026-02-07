import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { chatWithAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", authMiddleware, chatWithAI);

export default router;
