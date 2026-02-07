import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import usdaFoodRoutes from "./routes/usdaFoodRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/usda", usdaFoodRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
