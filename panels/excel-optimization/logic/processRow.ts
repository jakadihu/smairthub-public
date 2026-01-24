// logic/processRow.ts
import { callAI } from "../services/ai";
import { buildRowProcessPrompt } from "./prompts/rowProcessPrompt";

export async function processRow(row, headers, types) {
  const prompt = buildRowProcessPrompt(headers, types, row);
  const raw = await callAI(prompt);

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return {
      normalized: row,
      errors: [{ field: "_row", message: "AI returned no JSON" }],
      fixes: [],
      score: 0,
    };
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    return {
      normalized: row,
      errors: [{ field: "_row", message: "Invalid JSON from AI" }],
      fixes: [],
      score: 0,
    };
  }
}
