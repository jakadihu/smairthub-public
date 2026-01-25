// logic/detectHeader.ts
import { callAI } from "@/panels/excel-optimization/services/ai";
import { buildHeaderDetectPrompt } from "@/panels/excel-optimization/logic/prompts/headerDetectPrompt";

export interface HeaderDetectionResult {
  hasHeader: boolean;
  headerRowIndex: number;
  headers: string[];
  types: string[];
  dataStartIndex: number;
}

export async function detectHeader(
  sample: string[][],
  locale: string,
): Promise<HeaderDetectionResult> {
  const prompt = buildHeaderDetectPrompt(sample, locale);
  const raw = await callAI(prompt);

  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("detectHeader JSON parse error:", err, "raw:", raw);
    throw new Error("AI returned invalid JSON for header detection");
  }

  // --- VALIDÁCIÓ ---
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response is not an object");
  }

  if (!Array.isArray(parsed.headers)) {
    throw new Error("Missing or invalid 'headers' field");
  }

  if (parsed.headers.length === 0) {
    throw new Error("AI returned empty headers array");
  }

  // --- VÉGSŐ, TISZTA OUTPUT ---
  return {
    hasHeader: Boolean(parsed.hasHeader),
    headerRowIndex: Number(parsed.headerRowIndex ?? 0),
    headers: parsed.headers.map((h: any) => (h == null ? "" : String(h))),
    types: Array.isArray(parsed.types)
      ? parsed.types.map((t: any) => String(t))
      : [],
    dataStartIndex:
      parsed.dataStartIndex ??
      (parsed.hasHeader ? Number(parsed.headerRowIndex ?? 0) + 1 : 0),
  };
}
