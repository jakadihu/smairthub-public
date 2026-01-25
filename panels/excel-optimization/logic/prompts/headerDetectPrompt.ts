// logic/prompts/headerDetectPrompt.ts

export function buildHeaderDetectPrompt(sample: string[][]): string {
  return `
You are an expert in analyzing tabular data.

CRITICAL STRUCTURE RULES (FOLLOW EXACTLY):
- You MUST NOT add, remove, merge, reorder, rename, infer, or ignore ANY columns.
- The number of columns in the output "headers" MUST be EXACTLY the same as the number of columns in the input sample's longest row.
- You MUST NOT generate extra header cells.
- You MUST NOT drop empty columns.
- You MUST NOT compress or shift columns.
- You MUST NOT modify the structure of the sample in any way.
- If a column header is empty, missing, or blank, you MUST generate a meaningful, human-friendly header name based on the content of that column. Do not leave it empty.

TASK:
Determine whether the first row of the table is a header row WITHOUT altering the structure.

INPUT SAMPLE (first 10 rows):
${JSON.stringify(sample, null, 2)}

IMPORTANT:
You MUST respond with VALID JSON ONLY.
Do NOT include explanations, comments, or text before or after the JSON.
Do NOT wrap the JSON in backticks.

RETURN JSON EXACTLY in this format:
{
  "hasHeader": boolean,
  "headerRowIndex": number,
  "headers": string[],
  "types": string[],
  "dataStartIndex": number
}

Additional Rules:
- If the first row looks like column names, set hasHeader=true and headerRowIndex=0.
- If another row is the header, set headerRowIndex accordingly.
- If no header exists, set hasHeader=false and you MUST generate meaningful, human-friendly header names for every column based on the content of that column. Do not leave any header empty.
- The number of generated headers MUST match the number of columns EXACTLY.
- Infer basic types: string, number, boolean, date.
- dataStartIndex = headerRowIndex + 1 if hasHeader, otherwise 0.
`;
}
