/**
 * AI-alapú összegző prompt a batch validáció eredményeihez.
 * A panel maga építi a promptot, maga hívja az AI-t, maga értelmezi a választ.
 */

export function buildSummaryPrompt(batchResults: any[]) {
  return `
You are an expert data quality analyst. Summarize the validation results.

Return ONLY valid JSON with this structure:

{
  "overview": {
    "totalRows": number,
    "validRows": number,
    "invalidRows": number,
    "cancelledRows": number,
    "averageScore": number
  },
  "topIssues": [
    { "type": "string", "count": number, "exampleField": "string" }
  ],
  "recommendations": [
    "string"
  ]
}

Rules:
- Analyze the errors across all rows.
- Group errors by type (e.g. "type", "format", "duplicate", "integrity", "range", "typo").
- Identify the most common issues.
- Provide actionable recommendations.
- No comments, no explanation, no code blocks.

BatchResults: ${JSON.stringify(batchResults)}
`;
}
