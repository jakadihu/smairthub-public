const AI_HOST = process.env.AI_HOST;
const AI_MODEL = process.env.AI_MODEL || "phi3:medium";

export async function generateAIResponse(prompt) {
  const res = await fetch(`${AI_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.response;
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
You are a strict data normalizer.
Your task is to convert the given header labels into English snake_case field names.

Rules:
- Output MUST be valid JSON.
- Output MUST contain ONLY the JSON object.
- NO explanation, NO comments, NO extra text.
- NO code blocks.
- Keep keys exactly as received.
- Values must be normalized English snake_case identifiers.

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
You are a strict data validator. 
Return ONLY valid JSON with this exact structure:

{
  "valid": boolean,
  "errors": [{ "field": "...", "message": "..." }],
  "suggestedFixes": { "field": "value" }
}

Rules:
- Use only the provided fields.
- Detect empty, missing, malformed or inconsistent values.
- Convert dates to YYYY-MM-DD.
- Convert numbers to plain numeric form.
- No explanation, no comments, no code blocks.
- Output MUST be valid JSON.

Headers: ${JSON.stringify(headers)}
Row: ${JSON.stringify(row)}

Return ONLY the JSON object.
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



