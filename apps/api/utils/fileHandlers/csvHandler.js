// utils/fileHandlers/csvHandler.js
import { parse as parseCsv } from "csv-parse/sync";

export const handleCsv = {
  canHandle(file) {
    const mime = file.mimetype;
    const name = file.originalname.toLowerCase();
    return mime === "text/csv" || name.endsWith(".csv");
  },

  process(file) {
    const content = file.buffer.toString("utf8");
    const records = parseCsv(content, { bom: true });

    return {
      type: "csv",
      headers: records[0],
      rows: records.slice(1),
    };
  }
};
