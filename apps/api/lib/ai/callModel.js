// lib/ai/callModel.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callModel(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0,
    max_tokens: 2048,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  const text = response.choices?.[0]?.message?.content;

  if (!text) {
    console.error("AI returned no content:", response);
    throw new Error("AI response missing content");
  }

  return text.trim();
}
