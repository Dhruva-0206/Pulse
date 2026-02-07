import express from "express";
import {
  getFoods,
  createFood,
  updateFood,
  deleteFood
} from "../controllers/foodController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getFoods);
router.post("/", authMiddleware, createFood);
router.put("/:id", authMiddleware, updateFood);
router.delete("/:id", authMiddleware, deleteFood);

export default router;
