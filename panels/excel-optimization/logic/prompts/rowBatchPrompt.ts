export function buildRowBatchPrompt(headers, types, rows) {
  return `
You are the SMAIRTHUB Excel Row Validator.
You MUST output a SINGLE valid JSON object and NOTHING else.

STRICT RULES:
1. Output MUST be a single JSON object.
2. NO text before or after the JSON.
3. NO comments, NO explanations, NO code fences.
4. NO undefined, NaN, Infinity, or trailing commas.
5. The JSON MUST match EXACTLY this structure:

{
  "results": [
    {
      "index": 0,
      "success": true,
      "errorMessage": null,
      "normalized": {
        "<columnName>": {          
          "normalized": "<string | number | boolean | null>",
          "issues": [
            {
              "type": "<issueType>",
              "severity": "<warning | danger>",
              "message": "<human readable explanation>"
            }
          ],
          "score": 0.0
        }
      },
      "rowScore": 0.0,
      "rowStatus": "ok" | "warning" | "danger"
    }
  ]
}

RULES FOR THE "results" ARRAY:
- MUST have the same length as ROWS.
- MUST preserve the order of ROWS.
- Each item MUST contain ONLY:
  index, success, errorMessage, normalized, rowScore, rowStatus.

VALIDATION LOGIC (APPLY TO EACH CELL):
1. Presence check (empty or whitespace-only)
2. Type correctness (string, number, email, date, boolean)
3. Type convertibility (e.g. "42a" → number)
4. Whitespace issues (leading/trailing/multiple spaces)
5. Format inconsistency (date/number formatting)
6. Outlier detection (extreme or impossible values)
7. Excessive length
8. Non-ASCII or suspicious characters
9. Security risks (formulas, HTML, SQL injection)
10. AI-based anomaly detection (value does not fit semantics)

SEVERITY RULES:
- "danger" if the value is invalid, unsafe, or non-convertible.
- "warning" if the value is suspicious but usable.

ROW STATUS RULES:
- "danger" if ANY cell has a danger issue.
- "warning" if no danger but at least one warning.
- "ok" if no issues at all.

INPUT DATA:

HEADERS = ${JSON.stringify(headers)}
TYPES   = ${JSON.stringify(types)}
ROWS    = ${JSON.stringify(rows)}

Now output ONLY the JSON.
`;
}
