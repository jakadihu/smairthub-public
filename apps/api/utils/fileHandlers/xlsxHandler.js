// utils/fileHandlers/xlsxHandler.js
import { raw } from "express";
import * as XLSX from "xlsx";

export const handleXlsx = {
  canHandle(file) {
    const mime = file.mimetype || "";
    const name = file.originalname.toLowerCase();

    return (
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      mime.includes("spreadsheet") ||
      mime.includes("excel") ||
      mime === "application/octet-stream"
    );
  },
  // 1) METAADAT – a panel ebből tudja, mit kérhet
  inspect(file) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });

    return {
      type: "xlsx",
      sheets: workbook.SheetNames,
      supports: {
        multiSheet: true,
        raw: true,
        json: true,
      },
    };
  },

  // 2) ADAT – a panel mondja meg, mit akar
  process(file, options = {}) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });

    const sheetsToProcess = options.sheet
      ? Array.isArray(options.sheet)
        ? options.sheet
        : [options.sheet]
      : workbook.SheetNames;

    const result = {};

    for (const sheetName of sheetsToProcess) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // Mindig mátrixot adunk vissza
      const matrix = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      result[sheetName] = {
        raw: matrix,
        rowCount: matrix.length,
      };
    }

    return {
      type: "xlsx",
      sheets: result,
    };
  },
};
