// lib/ai/callModel.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callModel(prompt) {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  // 1) Ha van output_text → ezt használjuk
  if (response.output_text) {
    return response.output_text;
  }

  // 2) Ha nincs, akkor a strukturált outputból szedjük ki
  let text =
    response.output?.[0]?.content?.[0]?.text ??
    response.output?.[0]?.content?.[0]?.output_text;

  if (!text) {
    console.error("Unexpected AI response format:", response);
    throw new Error("AI response missing text");
  }

  // 3) Biztonsági tisztítás: ha code blockot ad vissza
  text = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return text;
}
