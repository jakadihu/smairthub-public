export function buildRowValidationPrompt(
  headers: string[],
  row: Record<string, any>,
  duplicateKeys: string[]
): string {
  return `
Validate the row using the given headers.
Return ONLY valid JSON with this structure:

{
  "valid": boolean,
  "errors": [
    { "field": "...", "type": "...", "message": "..." }
  ],
  "suggestedFixes": { "field": "value" },
  "score": number
}

Validation rules:
- Type checking: number, date, boolean, email, enum.
- Integrity rules: cross-field logic (e.g. start_date <= end_date).
- Required fields must not be empty.
- Detect duplicates using DuplicateKeys (if relevant).
- Detect likely typos and suggest corrected values.
- Range checks for numbers and dates.
- Use only provided fields.
- Convert dates to YYYY-MM-DD.
- Convert numbers to plain numeric form.
- Score: 100 for perfect, lower for warnings/errors.
- No explanation, no comments, no code blocks.

Headers: ${JSON.stringify(headers)}
Row: ${JSON.stringify(row)}
DuplicateKeys: ${JSON.stringify(duplicateKeys)}
`;
}
