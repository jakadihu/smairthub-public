export function buildCleanFilePrompt(rows: Record<string, any>[]): string {
  return `
You are a data cleaning assistant. Clean the dataset.

Return ONLY valid JSON with this structure:

{
  "cleanedRows": [ { ... } ],
  "removedRows": number,
  "notes": ["string"]
}

Cleaning rules:
- Remove rows that are completely empty.
- Remove rows where all fields are null, undefined, or whitespace.
- Trim whitespace from all string fields.
- Convert empty strings to null.
- Normalize inconsistent casing (e.g. " Yes ", "YES", "yes" → "yes").
- Keep the structure identical to the input.
- Do NOT infer new fields.
- Do NOT modify header names.
- No comments, no explanation, no code blocks.

Rows: ${JSON.stringify(rows)}
`;
}
