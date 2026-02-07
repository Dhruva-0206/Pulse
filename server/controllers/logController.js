import pool from "../db.js";

/* ---------- helpers ---------- */

function buildTotals(rows) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  const logs = rows.map((row) => {
    const factor = Number(row.quantity_g || 0) / 100;

    const calories = Number(row.calories_per_100g || 0) * factor;
    const protein = Number(row.protein_per_100g || 0) * factor;
    const carbs = Number(row.carbs_per_100g || 0) * factor;
    const fat = Number(row.fat_per_100g || 0) * factor;
    const fiber = Number(row.fiber_per_100g || 0) * factor;

    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;
    totalFiber += fiber;

    return {
      id: row.id,
      eaten_at: row.eaten_at,
      quantity_g: Number(row.quantity_g || 0),
      food: {
        id: Number(row.food_id),
        name: row.name,
        source: row.source
      },
      calculated: {
        calories: Math.round(calories),
        protein_g: Math.round(protein),
        carbs_g: Math.round(carbs),
        fat_g: Math.round(fat),
        fiber_g: Math.round(fiber)
      }
    };
  });

  return {
    logs,
    totals: {
      calories: Math.round(totalCalories),
      protein_g: Math.round(totalProtein),
      carbs_g: Math.round(totalCarbs),
      fat_g: Math.round(totalFat),
      fiber_g: Math.round(totalFiber)
    }
  };
}

function emptyMicros() {
  return {
    sodium_mg: 0,
    potassium_mg: 0,
    calcium_mg: 0,
    iron_mg: 0,
    magnesium_mg: 0,
    zinc_mg: 0,
    vitamin_a_mcg: 0,
    vitamin_c_mg: 0,
    vitamin_d_iu: 0,
    vitamin_b12_mcg: 0,
    folate_mcg: 0
  };
}

/* ---------- micronutrients ---------- */

const MICRO_NUTRIENT_IDS = {
  sodium_mg: 1093,
  potassium_mg: 1092,
  calcium_mg: 1087,
  iron_mg: 1089,
  magnesium_mg: 1090,
  zinc_mg: 1095,
  vitamin_a_mcg: 1104,
  vitamin_c_mg: 1162,
  vitamin_d_iu: 1110,
  vitamin_b12_mcg: 1178,
  folate_mcg: 1190
};

async function getTodayMicros(userId) {
  const nutrientIds = Object.values(MICRO_NUTRIENT_IDS);

  const result = await pool.query(
    `
      SELECT
        fl.quantity_g,
        fn.nutrient_id,
        fn.amount
      FROM food_logs fl
      JOIN fdc_food_nutrient fn
        ON fn.fdc_id = fl.food_id
      WHERE fl.user_id = $1
        AND DATE(fl.eaten_at) = CURRENT_DATE
        AND fn.nutrient_id = ANY($2::bigint[])
    `,
    [userId, nutrientIds]
  );

  const micros = emptyMicros();

  for (const row of result.rows) {
    const factor = Number(row.quantity_g || 0) / 100;
    const amount = Number(row.amount || 0) * factor;

    for (const [key, id] of Object.entries(MICRO_NUTRIENT_IDS)) {
      if (Number(row.nutrient_id) === Number(id)) {
        micros[key] += amount;
        break;
      }
    }
  }

  return {
    sodium_mg: Math.round(micros.sodium_mg),
    potassium_mg: Math.round(micros.potassium_mg),
    calcium_mg: Math.round(micros.calcium_mg),
    iron_mg: Number(micros.iron_mg.toFixed(1)),
    magnesium_mg: Math.round(micros.magnesium_mg),
    zinc_mg: Number(micros.zinc_mg.toFixed(1)),
    vitamin_a_mcg: Math.round(micros.vitamin_a_mcg),
    vitamin_c_mg: Math.round(micros.vitamin_c_mg),
    vitamin_d_iu: Math.round(micros.vitamin_d_iu),
    vitamin_b12_mcg: Number(micros.vitamin_b12_mcg.toFixed(1)),
    folate_mcg: Math.round(micros.folate_mcg)
  };
}

/* ---------- base query ---------- */

const BASE_LOG_QUERY = `
  SELECT
    fl.id,
    fl.food_id,
    fl.quantity_g,
    fl.eaten_at,

    COALESCE(cf.name, uf.description) AS name,

    CASE
      WHEN cf.fdc_id IS NOT NULL THEN 'custom'
      ELSE 'usda'
    END AS source,

    COALESCE(cf.calories_per_100g, usda.energy_kcal, 0) AS calories_per_100g,
    COALESCE(cf.protein_per_100g, usda.protein_g, 0) AS protein_per_100g,
    COALESCE(cf.carbs_per_100g, usda.carbs_g, 0) AS carbs_per_100g,
    COALESCE(cf.fat_per_100g, usda.fat_g, 0) AS fat_per_100g,
    COALESCE(cf.fiber_per_100g, usda.fiber_g, 0) AS fiber_per_100g

  FROM food_logs fl

  LEFT JOIN foods cf
    ON cf.fdc_id = fl.food_id
   AND cf.is_custom = TRUE

  LEFT JOIN fdc_food uf
    ON uf.fdc_id = fl.food_id

  LEFT JOIN LATERAL (
    SELECT
      MAX(CASE WHEN nutrient_id = 1008 THEN amount END) AS energy_kcal,
      MAX(CASE WHEN nutrient_id = 1003 THEN amount END) AS protein_g,
      MAX(CASE WHEN nutrient_id = 1005 THEN amount END) AS carbs_g,
      MAX(CASE WHEN nutrient_id = 1004 THEN amount END) AS fat_g,
      MAX(CASE WHEN nutrient_id = 1079 THEN amount END) AS fiber_g
    FROM fdc_food_nutrient fn
    WHERE fn.fdc_id = fl.food_id
  ) usda ON true
`;

/* ---------- controllers ---------- */

export async function addLog(req, res) {
  try {
    const userId = req.user.id;
    const { food_id, quantity_g } = req.body || {};

    if (!food_id || !quantity_g) {
      return res
        .status(400)
        .json({ message: "food_id and quantity_g are required" });
    }

    const result = await pool.query(
      `
        INSERT INTO food_logs (user_id, food_id, quantity_g)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [userId, food_id, quantity_g]
    );

    res.status(201).json({
      message: "Food logged",
      log: result.rows[0]
    });
  } catch (err) {
    console.error("addLog error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTodayLogs(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        ${BASE_LOG_QUERY}
        WHERE fl.user_id = $1
          AND DATE(fl.eaten_at) = CURRENT_DATE
        ORDER BY fl.eaten_at DESC
      `,
      [userId]
    );

    res.json(buildTotals(result.rows));
  } catch (err) {
    console.error("getTodayLogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getTodayLogsDetailed(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        ${BASE_LOG_QUERY}
        WHERE fl.user_id = $1
          AND DATE(fl.eaten_at) = CURRENT_DATE
        ORDER BY fl.eaten_at DESC
      `,
      [userId]
    );

    const data = buildTotals(result.rows);
    const micros = await getTodayMicros(userId);

    res.json({ ...data, micros });
  } catch (err) {
    console.error("getTodayLogsDetailed error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLogsByDate(req, res) {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date query is required" });
    }

    const result = await pool.query(
      `
        ${BASE_LOG_QUERY}
        WHERE fl.user_id = $1
          AND DATE(fl.eaten_at) = $2
        ORDER BY fl.eaten_at DESC
      `,
      [userId, date]
    );

    res.json({
      date,
      ...buildTotals(result.rows)
    });
  } catch (err) {
    console.error("getLogsByDate error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteLog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const check = await pool.query(
      "SELECT id FROM food_logs WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Log not found" });
    }

    await pool.query("DELETE FROM food_logs WHERE id = $1", [id]);

    res.json({ message: "Log deleted successfully" });
  } catch (err) {
    console.error("deleteLog error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
