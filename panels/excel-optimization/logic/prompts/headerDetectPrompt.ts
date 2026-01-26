export function buildHeaderDetectPrompt(
  sample: string[][],
  locale: string,
): string {
  return `
You are the SMAIRTHUB Header Detector.

LOCALE:
The user's locale is: "${locale}".
You MUST generate human-friendly header names in this locale.
Examples:
- locale="en" → "Name", "Email", "Phone", "Date", "Amount"
- locale="hu" → "Név", "E-mail", "Telefonszám", "Dátum", "Összeg"
- locale="de" → "Name", "E-Mail", "Telefon", "Datum", "Betrag"

YOUR TASK:
Analyze the tabular sample and determine:
- whether the file contains a header row,
- which row is the header,
- what the cleaned header names should be,
- and generate locale-appropriate human-friendly names when needed.

STRUCTURE RULES (STRICT):
- You MUST NOT add, remove, merge, reorder, or shift ANY columns.
- The number of headers MUST match EXACTLY the number of columns in the longest row.
- You MUST NOT drop empty columns.
- You MUST NOT modify the structure of the sample in any way.

HEADER LOGIC:

1) IF A HEADER EXISTS:
- Keep the original header text.
- Clean it:
  - remove invisible characters (BOM, zero-width spaces),
  - trim whitespace,
  - collapse multiple spaces,
  - remove trailing punctuation like ":" or "-".
- If a header cell is empty, blank, or becomes empty after cleaning:
  → You MUST generate a human-friendly name in the user's locale.
- You MUST NOT leave any header empty.

2) IF NO HEADER EXISTS:
- hasHeader = false
- headerRowIndex = null
- You MUST generate human-friendly names for ALL columns in the user's locale.
- Use column content to choose names like:
  - (en) "Date", "Email", "Phone", "Amount", "Name"
  - (hu) "Dátum", "E-mail", "Telefonszám", "Összeg", "Név"
  - (de) "Datum", "E-Mail", "Telefon", "Betrag", "Name"
- If the content is unclear → use localized generic names:
  - (en) "Column 1", "Column 2"
  - (hu) "Oszlop 1", "Oszlop 2"
  - (de) "Spalte 1", "Spalte 2"

UNIQUENESS RULE (STRICT):
- All header names MUST be globally unique.
- If two or more headers would end up with the same name after cleaning or generation:
  → You MUST modify the later ones by appending a localized numeric suffix.
- Suffix examples:
  - (en) "Name", "Name 2", "Name 3"
  - (hu) "Név", "Név 2", "Név 3"
  - (de) "Name", "Name 2", "Name 3"
- You MUST NOT leave any duplicate header names under any circumstances.

TYPE INFERENCE:
Types MUST be inferred ONLY from sample values.
Allowed types:
- "string"
- "number"
- "boolean"
- "date"
- "email"
- "phone"

OUTPUT FORMAT (STRICT):
Return ONLY valid JSON in this exact structure:

{
  "hasHeader": boolean,
  "headerRowIndex": number | null,
  "headers": string[],
  "types": string[],
  "dataStartIndex": number
}

dataStartIndex = headerRowIndex + 1 if hasHeader, otherwise 0.

INPUT SAMPLE (first 10 rows):
${JSON.stringify(sample, null, 2)}

Return ONLY the JSON. No explanations.
`;
}
