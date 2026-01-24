// utils/fileHandlers/pdfHandler.js
import { createRequire } from "module";
import iconv from "iconv-lite";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

function normalizePdfText(str) {
  if (!str) return "";

  // Unicode normalizálás
  let out = str.normalize("NFC");

  // Replacement karakterek eltávolítása
  out = out.replace(/\uFFFD/g, "");

  // Ha sok "Ã" vagy "Â" van → hibás UTF-8 → CP1250 fallback
  const suspicious = (out.match(/[ÃÂ]/g) || []).length > 5;
  if (suspicious) {
    const buf = Buffer.from(out, "utf8");
    out = iconv.decode(buf, "cp1250");
  }

  return out;
}

export const handlePdf = {
  canHandle(file) {
    const mime = file.mimetype;
    const name = file.originalname.toLowerCase();

    return mime === "application/pdf" || name.endsWith(".pdf");
  },

  async inspect(file) {
    const data = await pdf(file.buffer);

    return {
      type: "pdf",
      pages: data.numpages,
      supports: {
        multiSheet: false,
        raw: true,
        json: true,
      },
    };
  },

  async process(file, options = {}) {
    const data = await pdf(file.buffer);

    const cleanText = normalizePdfText(data.text);

    if (options.format === "raw") {
      return {
        type: "pdf",
        raw: cleanText,
        pages: data.numpages,
      };
    }

    const pages = cleanText
      .split(/\f/)
      .map((page) => page.trim())
      .filter(Boolean);

    return {
      type: "pdf",
      pages: pages.map((text, index) => ({
        page: index + 1,
        text,
      })),
      pageCount: pages.length,
    };
  },
};
