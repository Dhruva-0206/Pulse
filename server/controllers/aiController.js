import pool from "../db.js";
import {
  interpretUserMessage,
  fetchFoodMacrosFromWeb,
} from "../services/geminiService.js";

import {
  foodLoggedReply,
  profileUpdatedReply,
  deleteLogReply,
  fallbackChatReply,
} from "../utils/aiReplies.js";

import { minimalChat } from "../services/minimalChatService.js";

export async function chatWithAI(req, res) {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    const ai = await interpretUserMessage(message);

    if (!ai || ai.action === "chat") {
      try {
        const reply = await minimalChat(message);
        return res.json({ reply });
      } catch {
        return res.json({ reply: fallbackChatReply() });
      }
    }

    if (ai.action === "log_food" && Array.isArray(ai.items)) {
      for (const item of ai.items) {
        const foodName = item.name.trim();
        const quantity = Number(item.quantity_g || 100);

        const existing = await pool.query(
          `
            SELECT *
            FROM foods
            WHERE is_custom = TRUE
              AND name ILIKE $1
            LIMIT 1
          `,
          [`%${foodName}%`]
        );

        let foodId;
        let macros;

        if (existing.rows.length > 0) {
          const food = existing.rows[0];

          foodId = food.fdc_id;
          macros = {
            calories_per_100g: food.calories_per_100g,
            protein_per_100g: food.protein_per_100g,
            carbs_per_100g: food.carbs_per_100g,
            fat_per_100g: food.fat_per_100g,
            fiber_per_100g: food.fiber_per_100g,
          };
        } else {
          macros = await fetchFoodMacrosFromWeb(foodName);

          const newId = Date.now();

          await pool.query(
            `
              INSERT INTO foods
                (fdc_id, name, calories_per_100g, protein_per_100g,
                 carbs_per_100g, fat_per_100g, fiber_per_100g, is_custom)
              VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
            `,
            [
              newId,
              foodName,
              macros.calories_per_100g,
              macros.protein_per_100g,
              macros.carbs_per_100g,
              macros.fat_per_100g,
              macros.fiber_per_100g,
            ]
          );

          foodId = newId;
        }

        await pool.query(
          `
            INSERT INTO food_logs (user_id, food_id, quantity_g)
            VALUES ($1,$2,$3)
          `,
          [userId, foodId, quantity]
        );
      }

      return res.json({
        reply: foodLoggedReply(ai.items),
      });
    }

    if (ai.action === "delete_log") {
      await pool.query(
        `
          DELETE FROM food_logs
          WHERE id = (
            SELECT id
            FROM food_logs
            WHERE user_id = $1
            ORDER BY eaten_at DESC
            LIMIT 1
          )
        `,
        [userId]
      );

      return res.json({
        reply: deleteLogReply(),
      });
    }

    if (ai.action === "update_profile" && ai.profile) {
      const {
        age,
        gender,
        height_cm,
        weight_kg,
        activity_level,
        goal,
      } = ai.profile;

      await pool.query(
        `
          INSERT INTO user_profiles
            (user_id, age, gender, height_cm, weight_kg, activity_level, goal)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (user_id)
          DO UPDATE SET
            age = COALESCE(EXCLUDED.age, user_profiles.age),
            gender = COALESCE(EXCLUDED.gender, user_profiles.gender),
            height_cm = COALESCE(EXCLUDED.height_cm, user_profiles.height_cm),
            weight_kg = COALESCE(EXCLUDED.weight_kg, user_profiles.weight_kg),
            activity_level = COALESCE(EXCLUDED.activity_level, user_profiles.activity_level),
            goal = COALESCE(EXCLUDED.goal, user_profiles.goal)
        `,
        [
          userId,
          age,
          gender,
          height_cm,
          weight_kg,
          activity_level,
          goal,
        ]
      );

      return res.json({
        reply: profileUpdatedReply(ai.profile),
      });
    }

    return res.json({
      reply: fallbackChatReply(),
    });
  } catch (err) {
    console.error("PulseAI Controller Error:", err);
    return res.status(500).json({
      reply: "Sorry, I couldn’t process that right now 😅 Try again.",
    });
  }
}
