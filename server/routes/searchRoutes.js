import express from "express";
import { searchFoodsCombined } from "../controllers/searchController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, searchFoodsCombined);

export default router;
