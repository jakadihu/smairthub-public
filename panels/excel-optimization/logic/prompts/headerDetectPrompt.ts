// logic/prompts/headerDetectPrompt.ts
export function buildHeaderDetectPrompt(sample: string[][]): string {
  return `
You are an expert in analyzing tabular data.

TASK:
Determine whether the first row of the table is a header row.

INPUT SAMPLE (first 10 rows):
${JSON.stringify(sample, null, 2)}

RETURN JSON ONLY in this format:
{
  "hasHeader": boolean,
  "headerRowIndex": number,
  "headers": string[],
  "types": string[],
  "dataStartIndex": number
}

Rules:
- If the first row looks like column names, set hasHeader=true and headerRowIndex=0.
- If another row is the header, set headerRowIndex accordingly.
- If no header exists, set hasHeader=false and generate generic headers like ["col_1", "col_2", ...].
- Infer basic types: string, number, boolean, date.
- dataStartIndex = headerRowIndex + 1 if hasHeader, otherwise 0.
`;
}
