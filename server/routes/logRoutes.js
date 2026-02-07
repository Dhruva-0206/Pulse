import express from "express";
import {
  addLog,
  getTodayLogs,
  getTodayLogsDetailed,
  getLogsByDate,
  deleteLog
} from "../controllers/logController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addLog);

router.get("/today", authMiddleware, getTodayLogs);
router.get("/today/detailed", authMiddleware, getTodayLogsDetailed);
router.get("/today-detailed", authMiddleware, getTodayLogsDetailed);

router.get("/by-date", authMiddleware, getLogsByDate);
router.delete("/:id", authMiddleware, deleteLog);

export default router;
