import pool from "../db.js";

const activityMap = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

function calcBMR({ gender, weight_kg, height_cm, age }) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

function calcCalories(tdee, goal) {
  if (goal === "lose") return Math.round(tdee - 500);
  if (goal === "gain") return Math.round(tdee + 300);
  return Math.round(tdee);
}

function calcMacros(calories) {
  return {
    protein_g: Math.round((calories * 0.25) / 4),
    fat_g: Math.round((calories * 0.25) / 9),
    carbs_g: Math.round((calories * 0.5) / 4)
  };
}

export async function getTargets(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = result.rows[0];

    const multiplier = activityMap[profile.activity_level] || 1.2;
    const bmr = calcBMR(profile);
    const tdee = bmr * multiplier;
    const targetCalories = calcCalories(tdee, profile.goal);
    const macros = calcMacros(targetCalories);

    res.json({
      targets: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        target_calories: targetCalories,
        macros
      },
      profile: {
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        activity_level: profile.activity_level,
        goal: profile.goal
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
