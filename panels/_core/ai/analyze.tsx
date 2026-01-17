// panels/_core/ai/analyze.tsx

import type { AIAnalysisResult } from "./types";

/**
 * A fő belépési pont az AI-alapú adatértelmezéshez.
 * A pipeline minden AI-funkciója erre épül.
 */
export async function analyzeDataWithAI(
  rows: string[][]
): Promise<AIAnalysisResult> {
  // 1) Mintavétel – az első 50 sor elég az AI-nak
  const sample = rows.slice(0, 50);

  // 2) Prompt összeállítása
  const prompt = buildAnalysisPrompt(sample);

  // 3) AI hívás (később implementáljuk)
  const raw = await callLLM(prompt);

  // 4) JSON parse
  const parsed = parseAIResponse(raw);

  return parsed;
}

/**
 * Prompt generálása a mintasorokból.
 */
function buildAnalysisPrompt(sample: string[][]): string {
  return `
You are a data analysis engine. Your task is to analyze tabular data and return a JSON structure.

Input rows (first 50):
${JSON.stringify(sample, null, 2)}

Return a JSON object with the following structure:
{
  "header": {
    "rowIndex": number,
    "originalLabels": string[],
    "suggestedLabels": string[]
  },
  "columns": [
    {
      "index": number,
      "originalLabel": string | null,
      "suggestedLabel": string,
      "type": string,
      "confidence": number
    }
  ],
  "anomalies": [
    {
      "rowIndex": number,
      "columnIndex": number,
      "reason": string,
      "severity": "info" | "warning" | "error"
    }
  ],
  "profile": {
    "rowCount": number,
    "columnCount": number,
    "missingValues": number,
    "duplicateRows": number
  }
}

Only return valid JSON.
`;
}

/**
 * AI provider hívása – ezt később töltjük ki.
 */
async function callLLM(prompt: string): Promise<string> {
  // IDEIGLENES MOCK – amíg nincs valódi AI provider
  return JSON.stringify({
    header: { rowIndex: 0, originalLabels: [], suggestedLabels: [] },
    columns: [],
    anomalies: [],
    profile: {
      rowCount: 0,
      columnCount: 0,
      missingValues: 0,
      duplicateRows: 0,
    },
  });

  throw new Error("AI provider not implemented yet");
}

/**
 * A válasz JSON-ná alakítása.
 */
function parseAIResponse(raw: string): AIAnalysisResult {
  return JSON.parse(raw);
}
