//const AI_HOST = process.env.AI_HOST;
//const AI_MODEL = process.env.AI_MODEL || "gemma:2b";
//const AI_HOST = "http://smairthub.com:11434";
const AI_MODEL = "gpt-4o-mini";

export async function generateAIResponse(prompt) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      input: prompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed: ${res.status}`);
  }

  const data = await res.json();

  // 1) Ha van output_text → ezt használjuk
  if (data.output_text) {
    return data.output_text;
  }

  // 2) Ha nincs, akkor a strukturált outputból szedjük ki
  const text =
    data.output?.[0]?.content?.[0]?.text ??
    data.output?.[0]?.content?.[0]?.output_text;

  if (!text) {
    console.error("Unexpected AI response format:", data);
    throw new Error("AI response missing text");
  }

  return text;
}

export async function normalizeHeaders(headers) {
  const prompt = buildHeaderNormalizePrompt(headers);
  const raw = await generateAIResponse(prompt);

  // próbáljuk JSON-ként értelmezni
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse AI header mapping JSON, raw:", raw);
  }

  // ha nem sikerült, fallback: identitás mapping
  const fallback = {};
  for (const h of headers) {
    fallback[h] = h;
  }
  return fallback;
}

function buildHeaderNormalizePrompt(headers) {
  return `
Convert the given header labels to English snake_case.
Return ONLY valid JSON: { "original": "normalized" }.
No text, no comments.

Headers: ${JSON.stringify(headers)}
`;
}

function cleanAIJSON(raw) {
  return raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/'''json/gi, "")
    .replace(/'''/g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

export async function validateRow(headers, row) {
  const prompt = buildRowValidationPrompt(headers, row);
  let raw = await generateAIResponse(prompt);

  raw = cleanAIJSON(raw);

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse row validation JSON:", raw);
    return {
      valid: false,
      errors: [{ field: null, message: "AI returned invalid JSON" }],
      suggestedFixes: {},
    };
  }
}

function buildRowValidationPrompt(headers, row) {
  return `
Validate the row using the given headers.
Return ONLY valid JSON:

{
  "valid": boolean,
  "errors": [{ "field": "...", "message": "..." }],
  "suggestedFixes": { "field": "value" }
}

Rules:
- Use only provided fields.
- Detect empty, malformed, inconsistent values.
- Convert dates to YYYY-MM-DD.
- Convert numbers to plain numeric form.

Headers: ${JSON.stringify(headers)}
Row: ${JSON.stringify(row)}
`;
}

export function buildBatchSummary(results) {
  const totalRows = results.length;
  let validRows = 0;
  let invalidRows = 0;
  const errorTypes = {};

  for (const r of results) {
    if (!r.success || r.error) {
      invalidRows++;
      continue;
    }

    const errors = r.errors || [];

    if (errors.length === 0) {
      validRows++;
    } else {
      invalidRows++;
      for (const e of errors) {
        const type = e.type || "unknown";
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      }
    }
  }

  return {
    totalRows,
    validRows,
    invalidRows,
    errorTypes,
  };
}
