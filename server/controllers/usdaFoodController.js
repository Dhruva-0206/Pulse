import pool from "../db.js";

export const searchFoods = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const offset = parseInt(req.query.offset || "0", 10);

    if (!q) {
      return res.status(400).json({ message: "q is required" });
    }

    const result = await pool.query(
      `
        SELECT
          fdc_id,
          description,
          data_type,
          publication_date
        FROM public.fdc_food
        WHERE description ILIKE $1
        ORDER BY fdc_id DESC
        LIMIT $2 OFFSET $3
      `,
      [`%${q}%`, limit, offset]
    );

    res.json({
      q,
      limit,
      offset,
      foods: result.rows
    });
  } catch (err) {
    console.error("searchFoods error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFoodNutrients = async (req, res) => {
  try {
    const fdcId = Number(req.params.fdcId);

    if (!fdcId) {
      return res.status(400).json({ message: "Invalid fdcId" });
    }

    const foodRes = await pool.query(
      `
        SELECT
          fdc_id,
          description,
          data_type
        FROM public.fdc_food
        WHERE fdc_id = $1
      `,
      [fdcId]
    );

    if (foodRes.rows.length === 0) {
      return res.status(404).json({ message: "Food not found" });
    }

    const nutrientsRes = await pool.query(
      `
        SELECT
          fn.nutrient_id,
          n.name AS nutrient_name,
          n.unit_name,
          fn.amount
        FROM public.fdc_food_nutrient fn
        JOIN public.fdc_nutrient n
          ON n.id = fn.nutrient_id
        WHERE fn.fdc_id = $1
        ORDER BY n.rank NULLS LAST, n.name
      `,
      [fdcId]
    );

    res.json({
      food: foodRes.rows[0],
      nutrients: nutrientsRes.rows
    });
  } catch (err) {
    console.error("getFoodNutrients error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFoodMacros = async (req, res) => {
  try {
    const fdcId = Number(req.params.fdcId);

    if (!fdcId) {
      return res.status(400).json({ message: "Invalid fdcId" });
    }

    const IDS = {
      calories: 1008,
      protein: 1003,
      carbs: 1005,
      fat: 1004,
      fiber: 1079
    };

    const result = await pool.query(
      `
        SELECT
          nutrient_id,
          amount
        FROM public.fdc_food_nutrient
        WHERE fdc_id = $1
          AND nutrient_id = ANY($2::int[])
      `,
      [fdcId, Object.values(IDS)]
    );

    const macros = {
      calories_kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0
    };

    for (const row of result.rows) {
      const nutrientId = Number(row.nutrient_id);
      const amount = Number(row.amount || 0);

      if (nutrientId === IDS.calories) macros.calories_kcal = amount;
      if (nutrientId === IDS.protein) macros.protein_g = amount;
      if (nutrientId === IDS.carbs) macros.carbs_g = amount;
      if (nutrientId === IDS.fat) macros.fat_g = amount;
      if (nutrientId === IDS.fiber) macros.fiber_g = amount;
    }

    res.json({
      fdc_id: fdcId,
      per_100g: macros
    });
  } catch (err) {
    console.error("getFoodMacros error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
