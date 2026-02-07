import pool from "../db.js";
import bcrypt from "bcrypt";

export const upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      goal
    } = req.body || {};

    if (
      !age ||
      !gender ||
      !height_cm ||
      !weight_kg ||
      !activity_level ||
      !goal
    ) {
      return res
        .status(400)
        .json({ message: "All profile fields are required" });
    }

    const result = await pool.query(
      `
        INSERT INTO user_profiles (
          user_id,
          age,
          gender,
          height_cm,
          weight_kg,
          activity_level,
          goal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id)
        DO UPDATE SET
          age = EXCLUDED.age,
          gender = EXCLUDED.gender,
          height_cm = EXCLUDED.height_cm,
          weight_kg = EXCLUDED.weight_kg,
          activity_level = EXCLUDED.activity_level,
          goal = EXCLUDED.goal,
          updated_at = NOW()
        RETURNING *
      `,
      [userId, age, gender, height_cm, weight_kg, activity_level, goal]
    );

    res.json({
      message: "Profile saved",
      profile: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const userRes = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      userRes.rows[0].password_hash
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [newHash, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
