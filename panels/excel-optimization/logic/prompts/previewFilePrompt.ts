export function buildPreviewFilePrompt(
  sampleRows: Record<string, any>[]
): string {
  return `
You are a data quality analyst. Review the sample dataset and identify potential issues.

Return ONLY valid JSON with this structure:

{
  "issues": ["string"],
  "qualityScore": number
}

Rules:
- Analyze only the provided sample rows.
- Identify common data quality issues:
  - inconsistent casing
  - missing values
  - mixed data types
  - suspicious patterns
  - formatting problems
  - potential duplicates
- Provide short, actionable issue descriptions.
- Score: 0–100 (100 = excellent quality).
- No comments, no explanation, no code blocks.

SampleRows: ${JSON.stringify(sampleRows)}
`;
}
