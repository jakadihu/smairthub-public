// utils/fileHandlers/xlsxHandler.js
import * as XLSX from "xlsx";

export const handleXlsx = {
  canHandle(file) {
    const mime = file.mimetype;
    const name = file.originalname.toLowerCase();

    return (
      mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mime === "application/vnd.ms-excel" ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls")
    );
  },

  process(file) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames;

    if (!sheetNames.length) {
      throw new Error("Nincs sheet az Excel fájlban.");
    }

    const firstSheetName = sheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const json = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    if (!json.length) {
      throw new Error("Üres Excel sheet.");
    }

    const headers = json[0];
    const rows = json.slice(1);

    return {
      type: "xlsx",
      sheet: firstSheetName,
      headers,
      rows,
      rowCount: rows.length,
    };
  }
};
