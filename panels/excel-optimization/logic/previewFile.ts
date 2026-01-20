import { callAI } from "../services/ai.js";
import { buildPreviewFilePrompt } from "./prompts/previewFilePrompt.js";

export interface FilePreviewResult {
  previewRows: Record<string, any>[];
  issues: string[];
  qualityScore: number;
}

/**
 * A panel-oldali fájl előnézet + gyors AI diagnózis.
 * - csak az első 20 sort küldjük az AI-nak
 * - gyors minőségi értékelés
 * - tipikus problémák felismerése
 */
export async function previewFile(
  rows: Record<string, any>[]
): Promise<FilePreviewResult> {
  const sample = rows.slice(0, 20);
  const prompt = buildPreviewFilePrompt(sample);

  const raw = await callAI(prompt);

  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    return {
      previewRows: sample,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      qualityScore:
        typeof parsed.qualityScore === "number"
          ? parsed.qualityScore
          : 50,
    };
  } catch (err) {
    console.error("previewFile JSON parse error:", err, raw);

    return {
      previewRows: sample,
      issues: ["AI returned invalid JSON"],
      qualityScore: 50,
    };
  }
}
