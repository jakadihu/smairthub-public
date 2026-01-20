// utils/fileHandlerRegistry.js

import { handleCsv } from "./fileHandlers/csvHandler.js";
import { handleXlsx } from "./fileHandlers/xlsxHandler.js";
import { handlePdf } from "./fileHandlers/pdfHandler.js";

const handlers = [
  handleCsv,
  handleXlsx,
  handlePdf,
  // később: handleJson, handleZip, handleImage, stb.
];

export function processUploadedFile(file) {
  for (const handler of handlers) {
    if (handler.canHandle(file)) {
      return handler.process(file);
    }
  }

  throw new Error("Nem támogatott fájltípus.");
}
