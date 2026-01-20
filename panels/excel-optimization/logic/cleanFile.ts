import { callAI } from "../services/ai.js";
import { buildCleanFilePrompt } from "./prompts/cleanFilePrompt.js";

export interface CleanFileResult {
  cleanedRows: Record<string, any>[];
  removedRows: number;
  notes: string[];
}

/**
 * A panel-oldali fájltisztító modul.
 * - AI segítségével megtisztítja a sorokat
 * - eltávolítja a teljesen üres vagy értelmezhetetlen sorokat
 * - egységesíti a whitespace-eket, null értékeket, stb.
 */
export async function cleanFile(
  rows: Record<string, any>[]
): Promise<CleanFileResult> {
  const prompt = buildCleanFilePrompt(rows);
  const raw = await callAI(prompt);

  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    return {
      cleanedRows: Array.isArray(parsed.cleanedRows)
        ? parsed.cleanedRows
        : [],
      removedRows: typeof parsed.removedRows === "number"
        ? parsed.removedRows
        : 0,
      notes: Array.isArray(parsed.notes)
        ? parsed.notes
        : [],
    };
  } catch (err) {
    console.error("cleanFile JSON parse error:", err, raw);

    return {
      cleanedRows: rows,
      removedRows: 0,
      notes: ["AI returned invalid JSON, original rows returned unchanged."],
    };
  }
}
