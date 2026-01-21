import { handleCsv } from "./fileHandlers/csvHandler.js";
import { handleXlsx } from "./fileHandlers/xlsxHandler.js";
import { handlePdf } from "./fileHandlers/pdfHandler.js";

const handlers = [handleXlsx, handlePdf, handleCsv];

export async function inspectFile(file) {
  for (const handler of handlers) {
    if (handler.canHandle(file)) {
      return await handler.inspect(file);
    }
  }
  throw new Error("Nem támogatott fájltípus.");
}

export async function processFile(file, options) {
  for (const handler of handlers) {
    if (handler.canHandle(file)) {
      return await handler.process(file, options);
    }
  }
  throw new Error("Nem támogatott fájltípus.");
}
