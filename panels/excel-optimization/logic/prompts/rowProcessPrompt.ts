// prompts/rowProcessPrompt.ts

export function buildRowProcessPrompt(
  headers: string[],
  types: string[],
  row: Record<string, any>
) {
  return `
You are an expert data validator and normalizer.

TASK:
Validate, normalize and score a single row of tabular data.

HEADERS:
${JSON.stringify(headers)}

TYPES:
${JSON.stringify(types)}

ROW:
${JSON.stringify(row)}

RETURN STRICT JSON ONLY:
{
  "normalized": { "col": value, ... },
  "errors": [{ "field": string, "message": string }],
  "fixes": [{ "field": string, "old": any, "new": any }],
  "score": number
}

RULES:
- Respond with VALID JSON ONLY.
- No explanations.
- No comments.
- No text before or after the JSON.
- Convert values to the correct type.
- If a value is invalid, include an error.
- If a value can be corrected, include a fix.
- Score starts at 100 and subtract penalties for errors.
`;
}
