import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Lightweight conversational fallback for PulseAI.
 * Used when no structured action (log/update/delete) is required.
 * - No JSON
 * - No database access
 * - Short, friendly responses only
 */
export async function minimalChat(message) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are PulseAI — a friendly gym and nutrition companion.

Guidelines:
- Keep replies to 2–4 short lines
- Encouraging and practical tone
- Focus only on fitness, food, and habits
- No medical advice
- No extreme or absolute claims

User message:
"${message}"
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
