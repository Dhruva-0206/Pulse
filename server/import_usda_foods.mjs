import fs from "fs";
import path from "path";
import csv from "csv-parser";
import pool from "./db.js";

const DATASET_DIR = path.join(process.cwd(), "dataset");

/* USDA nutrient IDs (common macros we care about) */
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003,  // Protein (g)
  carbs: 1005,    // Carbohydrate (g)
  fat: 1004,      // Total fat (g)
  fiber: 1079,    // Dietary fiber (g)
};

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function main() {
  try {
    console.log("📥 Reading USDA CSV files...");

    const foodPath = path.join(DATASET_DIR, "food.csv");
    const nutrientPath = path.join(DATASET_DIR, "nutrient.csv");
    const foodNutrientPath = path.join(DATASET_DIR, "food_nutrient.csv");

    const foods = await readCSV(foodPath);
    const nutrients = await readCSV(nutrientPath);
    const foodNutrients = await readCSV(foodNutrientPath);

    console.log(`✅ food.csv rows: ${foods.length}`);
    console.log(`✅ nutrient.csv rows: ${nutrients.length}`);
    console.log(`✅ food_nutrient.csv rows: ${foodNutrients.length}`);

    /* Build nutrient lookup (id → name)
       Not strictly required, but useful for debugging */
    const nutrientMap = new Map();
    for (const n of nutrients) {
      nutrientMap.set(Number(n.id), n.name);
    }

    /* Build food lookup (fdc_id → food name) */
    const foodMap = new Map();
    for (const f of foods) {
      const fdcId = Number(f.fdc_id);
      const name = (f.description || "").trim();

      if (!fdcId || !name) continue;
      foodMap.set(fdcId, name);
    }

    /* Build macro values per food (fdc_id → macros) */
    const macroByFood = new Map();

    for (const fn of foodNutrients) {
      const fdcId = Number(fn.fdc_id);
      const nutrientId = Number(fn.nutrient_id);
      const amount = Number(fn.amount);

      if (!fdcId || !nutrientId || Number.isNaN(amount)) continue;

      // keep only nutrients we care about
      if (
        nutrientId !== NUTRIENT_IDS.calories &&
        nutrientId !== NUTRIENT_IDS.protein &&
        nutrientId !== NUTRIENT_IDS.carbs &&
        nutrientId !== NUTRIENT_IDS.fat &&
        nutrientId !== NUTRIENT_IDS.fiber
      ) {
        continue;
      }

      if (!macroByFood.has(fdcId)) {
        macroByFood.set(fdcId, {
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0,
        });
      }

      const macros = macroByFood.get(fdcId);

      if (nutrientId === NUTRIENT_IDS.calories) macros.calories = amount;
      if (nutrientId === NUTRIENT_IDS.protein) macros.protein_g = amount;
      if (nutrientId === NUTRIENT_IDS.carbs) macros.carbs_g = amount;
      if (nutrientId === NUTRIENT_IDS.fat) macros.fat_g = amount;
      if (nutrientId === NUTRIENT_IDS.fiber) macros.fiber_g = amount;
    }

    console.log("🧠 Preparing final insert list...");

    const finalFoods = [];

    for (const [fdcId, name] of foodMap.entries()) {
      const macros = macroByFood.get(fdcId);
      if (!macros) continue;

      // keep foods with at least calories or protein
      if (!macros.calories && !macros.protein_g) continue;

      finalFoods.push({
        fdc_id: fdcId,
        name,
        calories: macros.calories || 0,
        protein: macros.protein_g || 0,
        carbs: macros.carbs_g || 0,
        fat: macros.fat_g || 0,
        fiber: macros.fiber_g || 0,
      });
    }

    console.log(`✅ Ready to insert: ${finalFoods.length} foods`);
    console.log("🚀 Inserting into foods table...");

    let inserted = 0;

    for (const item of finalFoods) {
      await pool.query(
        `
        INSERT INTO foods
          (fdc_id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (fdc_id) DO NOTHING
        `,
        [
          item.fdc_id,
          item.name,
          item.calories,
          item.protein,
          item.carbs,
          item.fat,
          item.fiber,
        ]
      );

      inserted++;
      if (inserted % 500 === 0) {
        console.log(`... inserted ${inserted}`);
      }
    }

    console.log(`🎉 Done. Inserted ~${inserted} rows (duplicates skipped).`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
}

main();
