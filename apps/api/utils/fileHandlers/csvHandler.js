// utils/fileHandlers/csvHandler.js
import { parse } from "csv-parse/sync";
import chardet from "chardet";
import iconv from "iconv-lite";

// Automatikus delimiter felismerés
function detectDelimiter(sample) {
  const delimiters = [",", ";", "\t", "|"];
  const scores = {};

  for (const d of delimiters) {
    const count = sample
      .split("\n")
      .slice(0, 3)
      .map((line) => (line.match(new RegExp(`\\${d}`, "g")) || []).length)
      .reduce((a, b) => a + b, 0);

    scores[d] = count;
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// 🔥 Központi dekódoló – minden CSV itt megy át
function decodeCsvBuffer(buffer) {
  // 1) Kódolás felismerése
  const detected = chardet.detect(buffer) || "utf-8";

  // 2) Dekódolás
  let text = iconv.decode(buffer, detected);

  // 3) BOM eltávolítása
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  return text;
}

export const handleCsv = {
  canHandle(file) {
    const name = file.originalname.toLowerCase();
    const mime = file.mimetype;

    return (
      mime === "text/csv" ||
      mime === "application/csv" ||
      name.endsWith(".csv")
    );
  },

  inspect(file) {
    const text = decodeCsvBuffer(file.buffer);

    const delimiter = detectDelimiter(text);
    const hasQuotes = text.includes('"');

    const preview = parse(text, {
      delimiter,
      quote: hasQuotes ? '"' : null,
      columns: false,
      skip_empty_lines: true,
      trim: true,
      to_line: 5,
      relax_column_count: true,
      relax_column_count_less: true,
      relax_column_count_more: true,
      relax_quotes: true,
    });

    return {
      type: "csv",
      delimiter,
      preview,
      supports: {
        multiSheet: false,
        raw: true,
        json: true,
      },
    };
  },

  process(file, options = {}) {
    const text = decodeCsvBuffer(file.buffer);

    const delimiter = detectDelimiter(text);
    const hasQuotes = text.includes('"');

    const rows = parse(text, {
      delimiter,
      quote: hasQuotes ? '"' : null,
      columns: false,
      skip_empty_lines: false,
      trim: false,
      relax_column_count: true,
      relax_column_count_less: true,
      relax_column_count_more: true,
      relax_quotes: true,
    });

    return {
      type: "csv",
      raw: rows,
      delimiter,
      rowCount: rows.length,
    };
  },
};
