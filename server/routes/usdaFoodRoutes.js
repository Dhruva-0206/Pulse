import express from "express";
import {
  searchFoods,
  getFoodNutrients,
  getFoodMacros
} from "../controllers/usdaFoodController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, searchFoods);
router.get("/:fdcId/nutrients", authMiddleware, getFoodNutrients);
router.get("/:fdcId/macros", authMiddleware, getFoodMacros);

export default router;
