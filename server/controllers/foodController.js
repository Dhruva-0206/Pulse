import pool from "../db.js";

export async function getFoods(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 200);
    const offset = parseInt(req.query.offset || "0", 10);
    const q = (req.query.q || "").trim();

    let result;

    if (q.length > 0) {
      result = await pool.query(
        `
          SELECT
            fdc_id AS id,
            name,
            calories_per_100g,
            protein_per_100g,
            carbs_per_100g,
            fat_per_100g,
            fiber_per_100g,
            created_at,
            is_custom
          FROM foods
          WHERE is_custom = TRUE
            AND name ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `,
        [`%${q}%`, limit, offset]
      );
    } else {
      result = await pool.query(
        `
          SELECT
            fdc_id AS id,
            name,
            calories_per_100g,
            protein_per_100g,
            carbs_per_100g,
            fat_per_100g,
            fiber_per_100g,
            created_at,
            is_custom
          FROM foods
          WHERE is_custom = TRUE
          ORDER BY created_at DESC
          LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );
    }

    res.json({
      foods: result.rows,
      limit,
      offset,
      q
    });
  } catch (err) {
    console.error("getFoods error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createFood(req, res) {
  try {
    const {
      name,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      fiber_per_100g
    } = req.body;

    if (!name || calories_per_100g === undefined) {
      return res
        .status(400)
        .json({ message: "Name and calories_per_100g required" });
    }

    const customFdcId = Date.now();

    const result = await pool.query(
      `
        INSERT INTO foods (
          fdc_id,
          name,
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g,
          fiber_per_100g,
          is_custom
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        RETURNING
          fdc_id AS id,
          name,
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g,
          fiber_per_100g,
          created_at,
          is_custom
      `,
      [
        customFdcId,
        name.trim(),
        Number(calories_per_100g || 0),
        Number(protein_per_100g || 0),
        Number(carbs_per_100g || 0),
        Number(fat_per_100g || 0),
        Number(fiber_per_100g || 0)
      ]
    );

    res.status(201).json({
      message: "Food created",
      food: result.rows[0]
    });
  } catch (err) {
    console.error("createFood error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateFood(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      fiber_per_100g
    } = req.body;

    const result = await pool.query(
      `
        UPDATE foods
        SET
          name = $1,
          calories_per_100g = $2,
          protein_per_100g = $3,
          carbs_per_100g = $4,
          fat_per_100g = $5,
          fiber_per_100g = $6
        WHERE fdc_id = $7
          AND is_custom = TRUE
        RETURNING
          fdc_id AS id,
          name,
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g,
          fiber_per_100g,
          created_at,
          is_custom
      `,
      [
        (name || "").trim(),
        Number(calories_per_100g || 0),
        Number(protein_per_100g || 0),
        Number(carbs_per_100g || 0),
        Number(fat_per_100g || 0),
        Number(fiber_per_100g || 0),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Custom food not found / cannot update USDA food"
      });
    }

    res.json({
      message: "Food updated",
      food: result.rows[0]
    });
  } catch (err) {
    console.error("updateFood error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteFood(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM food_logs WHERE food_id = $1",
      [id]
    );

    const result = await pool.query(
      `
        DELETE FROM foods
        WHERE fdc_id = $1
          AND is_custom = TRUE
        RETURNING fdc_id AS id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Custom food not found / cannot delete USDA food"
      });
    }

    res.json({ message: "Food deleted" });
  } catch (err) {
    console.error("deleteFood error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
