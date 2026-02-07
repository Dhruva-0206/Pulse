import pool from "../db.js";

export const searchFoodsCombined = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 30);

    if (!q) {
      return res.json({ q, limit, foods: [] });
    }

    const customRes = await pool.query(
      `
        SELECT
          fdc_id AS id,
          name,
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g,
          fiber_per_100g,
          'custom' AS source
        FROM foods
        WHERE name ILIKE $1
        ORDER BY fdc_id DESC
        LIMIT $2
      `,
      [`%${q}%`, limit]
    );

    const usdaRes = await pool.query(
      `
        SELECT
          f.fdc_id AS id,
          f.description AS name,
          f.data_type,
          f.publication_date,
          'usda' AS source
        FROM fdc_food f
        WHERE f.description ILIKE $1
        ORDER BY f.fdc_id DESC
        LIMIT $2
      `,
      [`%${q}%`, limit]
    );

    const foods = [...customRes.rows, ...usdaRes.rows].slice(0, limit);

    res.json({ q, limit, foods });
  } catch (err) {
    console.error("searchFoodsCombined error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
