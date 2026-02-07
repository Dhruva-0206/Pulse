import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function safeJsonParse(text) {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini JSON parse failed:", text);
    return null;
  }
}

export async function interpretUserMessage(message) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are PulseAI (a calorie tracking assistant).

STRICT RULES:
- Respond ONLY with valid JSON
- No markdown
- No backticks
- No explanations

INTENTS:
- chat
- log_food
- delete_log
- update_profile

FOOD RULES:
- If food is mentioned → log_food
- Multiple foods allowed
- Quantity defaults to 100g if missing

PROFILE RULES:
- If user mentions age, gender, height, weight, activity level, or goal → update_profile
- Extract ONLY mentioned fields
- Do NOT invent missing fields

JSON FORMAT (EXACT):

{
  "action": "chat | log_food | delete_log | update_profile",
  "items": [
    {
      "name": "string",
      "quantity_g": number
    }
  ],
  "profile": {
    "age": number | null,
    "gender": "male | female | other" | null,
    "height_cm": number | null,
    "weight_kg": number | null,
    "activity_level": "low | moderate | high" | null,
    "goal": "cut | maintain | bulk" | null
  }
}

User message:
"${message}"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return safeJsonParse(text) || { action: "chat" };
}

export async function fetchFoodMacrosFromWeb(foodName) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Give approximate nutrition for "${foodName}" per 100 grams.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No text

{
  "calories_per_100g": number,
  "protein_per_100g": number,
  "carbs_per_100g": number,
  "fat_per_100g": number,
  "fiber_per_100g": number
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = safeJsonParse(text);

  if (!parsed) {
    throw new Error("Gemini nutrition fetch failed");
  }

  return parsed;
}
