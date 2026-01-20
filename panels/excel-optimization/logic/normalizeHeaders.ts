import { buildHeaderNormalizePrompt } from "./prompts/headerNormalizePrompt.js";
import { callAI } from "../services/ai.js";

export interface NormalizedHeadersResult {
  normalized: string[];
  mapping: Record<string, string>;
}

export async function normalizeHeaders(headers: string[]): Promise<NormalizedHeadersResult> {
  const prompt = buildHeaderNormalizePrompt(headers);
  const raw = await callAI(prompt);

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed &&
      Array.isArray(parsed.normalized) &&
      typeof parsed.mapping === "object"
    ) {
      return {
        normalized: parsed.normalized,
        mapping: parsed.mapping,
      };
    }
  } catch (e) {
    console.error("Failed to parse AI header mapping JSON, raw:", raw);
  }

  // fallback: identitás mapping
  const mapping: Record<string, string> = {};
  for (const h of headers) {
    mapping[h] = h;
  }

  return {
    normalized: headers,
    mapping,
  };
}
