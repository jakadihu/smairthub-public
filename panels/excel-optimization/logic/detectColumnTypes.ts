import { callAI } from "../services/ai.js";
import { buildColumnTypePrompt } from "./prompts/columnTypePrompt.js";

export interface ColumnTypeMap {
  [column: string]: string;
}

export async function detectColumnTypes(
  headers: string[],
  sampleRows: Record<string, any>[]
): Promise<ColumnTypeMap> {
  const prompt = buildColumnTypePrompt(headers, sampleRows);
  const raw = await callAI(prompt);

  try {
    const parsed = JSON.parse(raw);

    if (!parsed.types || typeof parsed.types !== "object") {
      throw new Error("Invalid AI response: missing 'types' field");
    }

    return parsed.types as ColumnTypeMap;
  } catch (err) {
    console.error("detectColumnTypes JSON parse error:", err, "raw:", raw);
    throw new Error("AI returned invalid JSON for column type detection");
  }
}
