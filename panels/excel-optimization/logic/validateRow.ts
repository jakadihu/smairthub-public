import { callAI } from "../services/ai.js";
import { buildRowValidationPrompt } from "./prompts/rowValidationPrompt.js";
import { inferScoreFromErrors } from "./inferScore.js";

export interface RowValidationResult {
  valid: boolean;
  errors: Array<{
    field: string | null;
    type: string;
    message: string;
  }>;
  suggestedFixes: Record<string, any>;
  score: number;
}

/**
 * Egyetlen sor validálása AI segítségével.
 * A panel maga építi a promptot, maga hívja az AI-t, maga értelmezi a választ.
 */
export async function validateRow(
  headers: string[],
  row: Record<string, any>,
  duplicateKeys: string[] = []
): Promise<RowValidationResult> {
  const prompt = buildRowValidationPrompt(headers, row, duplicateKeys);
  const raw = await callAI(prompt);

  // Biztonsági tisztítás: ha code blockot ad vissza
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    return {
      valid: typeof parsed.valid === "boolean" ? parsed.valid : false,
      errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      suggestedFixes:
        parsed.suggestedFixes && typeof parsed.suggestedFixes === "object"
          ? parsed.suggestedFixes
          : {},
      score:
        typeof parsed.score === "number"
          ? parsed.score
          : inferScoreFromErrors(parsed.errors),
    };
  } catch (err) {
    console.error("validateRow JSON parse error:", err, "raw:", raw);

    return {
      valid: false,
      errors: [
        {
          field: null,
          type: "json",
          message: "AI returned invalid JSON",
        },
      ],
      suggestedFixes: {},
      score: 0,
    };
  }
}
