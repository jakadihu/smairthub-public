import { callAI } from "../services/ai";
import { buildRowBatchPrompt } from "./prompts/rowBatchPrompt";

export function extractJsonBlock(text: string) {
  if (!text) return null;

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (char === '"' && !escape) {
      inString = !inString;
    }

    escape = char === "\\" && !escape;

    if (!inString) {
      if (char === "{") depth++;
      if (char === "}") depth--;

      if (depth === 0) {
        const jsonString = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(jsonString);
        } catch {
          // próbáljuk a következő '{'-t
        }
      }
    }
  }

  return null;
}

export async function processBatch(chunk, headers, types) {
  const prompt = buildRowBatchPrompt(headers, types, chunk);

  const aiResponse = await callAI(prompt);
  const json = extractJsonBlock(aiResponse);

  // Ha nincs results tömb → minden sor hibás
  if (!json || !Array.isArray(json.results)) {
    console.error("AI invalid JSON:", { aiResponse, prompt, chunk });

    return chunk.map((row, i) => ({
      index: i,
      success: false,
      errorMessage: "AI returned invalid JSON",
      original: row,
      normalized: null,
      rowScore: 0,
      rowStatus: "danger"
    }));
  }

  // A results tömb hosszának egyeznie kell
  if (json.results.length !== chunk.length) {
    console.error("AI returned wrong number of results:", {
      expected: chunk.length,
      got: json.results.length,
      aiResponse,
      prompt
    });

    return chunk.map((row, i) => ({
      index: i,
      success: false,
      errorMessage: "AI returned wrong number of results",
      original: row,
      normalized: null,
      rowScore: 0,
      rowStatus: "danger"
    }));
  }

  // Soronkénti feldolgozás
  return json.results.map((r, i) => {
    const success = typeof r.success === "boolean" ? r.success : false;
    const normalized = r.normalized ?? null;
    const errorMessage = r.errorMessage ?? (success ? null : "Unknown error");

    return {
      index: i,
      success,
      errorMessage,
      original: chunk[i],     // nálad van a nyers adat
      normalized,             // cellaszintű diagnózis
      rowScore: r.rowScore ?? 0,
      rowStatus: r.rowStatus ?? (success ? "ok" : "danger")
    };
  });
}
