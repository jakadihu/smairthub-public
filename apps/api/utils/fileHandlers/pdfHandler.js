// utils/fileHandlers/pdfHandler.js
import pdfParse from "pdf-parse";

export const handlePdf = {
  canHandle(file) {
    return file.mimetype === "application/pdf";
  },

  async process(file) {
    const data = await pdfParse(file.buffer);
    return {
      type: "pdf",
      text: data.text,
      metadata: data.info,
    };
  }
};