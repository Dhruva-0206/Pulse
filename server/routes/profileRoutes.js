import express from "express";
import {
  getProfile,
  upsertProfile,
  changePassword
} from "../controllers/profileController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.post("/", authMiddleware, upsertProfile);
router.put("/", authMiddleware, upsertProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
