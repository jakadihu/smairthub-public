export function buildRowBatchPrompt(headers, types, rows) {
  return `
You are a JSON-only transformation engine.

Your output MUST follow these rules with ZERO exceptions:

1. Output MUST be a SINGLE valid JSON object.
2. Output MUST NOT contain:
   - any text before the JSON
   - any text after the JSON
   - explanations, comments, notes
   - code fences (no \`\`\`json or \`\`\` at all)
   - multiple JSON objects
   - trailing commas
   - undefined, NaN, Infinity
3. The JSON MUST match EXACTLY this structure:

{
  "results": [
    {
      "index": 0,
      "success": true,
      "errorMessage": null,
      "normalized": { }
    }
  ]
}

4. The "results" array MUST:
   - have the same length as ROWS
   - preserve the order of ROWS
   - contain ONLY the fields: index, success, errorMessage, normalized

5. Validation rules:
   - If a row is valid: success=true, errorMessage=null, normalized=<normalized object>
   - If a row is invalid: success=false, normalized=null, errorMessage="<reason>"

6. ABSOLUTELY NO OTHER FIELDS ARE ALLOWED.

---

INPUT DATA:

HEADERS = ${JSON.stringify(headers)}
TYPES   = ${JSON.stringify(types)}
ROWS    = ${JSON.stringify(rows)}

---

Now produce the JSON output ONLY.
`;
}
