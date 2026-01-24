import { callAI } from "../services/ai";
import { buildRowBatchPrompt } from "./prompts/rowBatchPrompt";

export function extractJsonBlock(text: string) {
  if (!text) return null;

  // 1) Távolítsuk el a code fence-eket, ha vannak
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 2) Keressük meg az első '{' karaktert
  let start = cleaned.indexOf("{");
  if (start === -1) return null;

  // 3) Karakterenkénti zárójel-számlálás
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    // String kezelése (idézőjelek)
    if (char === '"' && !escape) {
      inString = !inString;
    }

    // Escape karakter
    escape = char === "\\" && !escape;

    if (!inString) {
      if (char === "{") depth++;
      if (char === "}") depth--;

      // Ha depth visszaért 0-ra → teljes JSON objektum
      if (depth === 0) {
        const jsonString = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(jsonString);
        } catch {
          // Ha nem parse-olható, akkor is próbáljuk a következő '{'-t
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
    console.log("json.result:", json.results);
    console.error("AI invalid JSON:", { aiResponse, prompt, chunk });
    return chunk.map((row, i) => ({
      index: i,
      success: false,
      errorMessage: "AI returned invalid JSON",
      original: row,
      normalized: null
    }));
  }

  // A results tömb hosszának EGYEZNIE kell a chunk hosszával
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
      normalized: null
    }));
  }

  // Determinisztikus, sor-alapú feldolgozás
  return json.results.map((r, i) => {
    const success = typeof r.success === "boolean" ? r.success : false;
    const normalized = r.normalized ?? null;
    const errorMessage = r.errorMessage ?? (success ? null : "Unknown error");

    return {
      index: i,                 // mindig a saját sor indexe
      success,
      errorMessage,
      original: chunk[i],       // mindig a saját eredeti sora
      normalized
    };
  });
}
