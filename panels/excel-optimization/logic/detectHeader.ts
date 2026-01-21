// logic/detectHeader.ts
import { callAI } from "@/panels/excel-optimization/services/ai";
import { buildHeaderDetectPrompt } from "@/panels/excel-optimization/logic/prompts/headerDetectPrompt";

export interface HeaderDetectionResult {
  hasHeader: boolean;
  headerRowIndex: number;
  headers: string[];
  types?: string[];
  dataStartIndex: number;
}

export async function detectHeader(sample: string[][]): Promise<HeaderDetectionResult> {
  const prompt = buildHeaderDetectPrompt(sample);
  const raw = await callAI(prompt);

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed !== "object") {
      throw new Error("AI response is not an object");
    }

    if (!Array.isArray(parsed.headers)) {
      throw new Error("Missing or invalid 'headers' field");
    }

    return {
      hasHeader: Boolean(parsed.hasHeader),
      headerRowIndex: parsed.headerRowIndex ?? 0,
      headers: parsed.headers,
      types: parsed.types || [],
      dataStartIndex: parsed.dataStartIndex ?? (parsed.hasHeader ? 1 : 0),
    };
  } catch (err) {
    console.error("detectHeader JSON parse error:", err, "raw:", raw);
    throw new Error("AI returned invalid JSON for header detection");
  }
}
