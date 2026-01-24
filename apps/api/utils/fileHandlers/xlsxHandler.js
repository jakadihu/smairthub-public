import * as XLSX from "xlsx";
import iconv from "iconv-lite";

function fixEncoding(value) {
  if (typeof value !== "string") return value;
  return iconv.decode(Buffer.from(value, "binary"), "cp1250");
}

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

  process(file, options = {}) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });

    const isXls = file.originalname.toLowerCase().endsWith(".xls");

    const sheetsToProcess = options.sheet
      ? Array.isArray(options.sheet)
        ? options.sheet
        : [options.sheet]
      : workbook.SheetNames;

    const result = {};

    for (const sheetName of sheetsToProcess) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // CP1250 → UTF-8 fix ONLY for .xls
      if (isXls) {
        for (const cell in sheet) {
          if (cell[0] === "!") continue;
          sheet[cell].v = fixEncoding(sheet[cell].v);
          sheet[cell].w = fixEncoding(sheet[cell].w);
        }
      }

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
