export function buildColumnTypePrompt(
  headers: string[],
  sampleRows: Record<string, any>[]
): string {
  return `
Analyze the dataset and determine the most likely data type for each column.
Return ONLY valid JSON with this structure:

{
  "types": {
    "columnName": "type"
  }
}

Allowed types:
- number
- integer
- float
- date
- datetime
- boolean
- email
- phone
- id
- currency
- enum
- text
- name

Rules:
- Use the sample rows to infer the type.
- If values vary but follow a pattern → enum.
- If values are mostly names → name.
- If values are mostly text → text.
- If uncertain → text.
- No comments, no explanation, no code blocks.

Headers: ${JSON.stringify(headers)}
Sample: ${JSON.stringify(sampleRows)}
`;
}
