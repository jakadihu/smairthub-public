export function buildHeaderNormalizePrompt(headers: string[]): string {
  return `
Normalize the following column headers.

Return ONLY valid JSON with this structure:

{
  "normalized": ["header1", "header2", ...],
  "mapping": {
    "originalHeader": "normalizedHeader"
  }
}

Normalization rules:
- Convert to lowercase.
- Replace spaces, hyphens, and special characters with underscores.
- Remove accents and diacritics.
- Trim whitespace.
- Ensure all headers are unique.
- If duplicates occur after normalization, append _1, _2, etc.
- Do NOT infer new fields.
- Do NOT remove fields.
- No comments, no explanation, no code blocks.

Headers: ${JSON.stringify(headers)}
`;
}
