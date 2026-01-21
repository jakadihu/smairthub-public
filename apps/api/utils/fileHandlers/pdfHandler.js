// utils/fileHandlers/pdfHandler.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const handlePdf = {
  canHandle(file) {
    const mime = file.mimetype;
    const name = file.originalname.toLowerCase();

    return (
      mime === "application/pdf" ||
      name.endsWith(".pdf")
    );
  },

  async inspect(file) {
    const data = await pdf(file.buffer);

    return {
      type: "pdf",
      pages: data.numpages,
      supports: {
        multiSheet: false,
        raw: true,
        json: true
      }
    };
  },

  async process(file, options = {}) {
    const data = await pdf(file.buffer);

    if (options.format === "raw") {
      return {
        type: "pdf",
        raw: data.text,
        pages: data.numpages
      };
    }

    const pages = data.text
      .split(/\f/)
      .map(page => page.trim())
      .filter(Boolean);

    return {
      type: "pdf",
      pages: pages.map((text, index) => ({
        page: index + 1,
        text
      })),
      pageCount: pages.length
    };
  }
};
