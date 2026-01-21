// utils/fileHandlers/csvHandler.js
import { parse } from "csv-parse/sync";

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

  // Legmagasabb előfordulás
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export const handleCsv = {
  canHandle(file) {
    const name = file.originalname.toLowerCase();
    const mime = file.mimetype;

    return (
      mime === "text/csv" || mime === "application/csv" || name.endsWith(".csv")
    );
  },

  inspect(file) {
    const text = file.buffer.toString("utf-8");

    const delimiter = detectDelimiter(text);
    const hasQuotes = text.includes('"');

    const preview = parse(text, {
      delimiter,
      quote: hasQuotes ? '"' : null,
      columns: false,
      skip_empty_lines: true,
      trim: true,
      to_line: 5, // több sor preview
      relax_column_count: true,
      relax_column_count_less: true,
      relax_column_count_more: true,
      relax_quotes: true,
      skip_empty_lines: true      
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
    const text = file.buffer.toString("utf-8");

    const delimiter = detectDelimiter(text);
    const hasQuotes = text.includes('"');

    // Mindig mátrixot adunk vissza
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
