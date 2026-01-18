import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";

export async function processUploadedFile(file) {
  const mime = file.mimetype;
  const originalName = file.originalname.toLowerCase();

  const isCsv =
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel" ||
    originalName.endsWith(".csv");

  const isXlsx =
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    originalName.endsWith(".xlsx") ||
    originalName.endsWith(".xls");

  if (!isCsv && !isXlsx) {
    throw new Error("Nem támogatott fájltípus. Csak CSV vagy Excel.");
  }

  if (isCsv) {
    return processCsvBuffer(file.buffer);
  }

  if (isXlsx) {
    return processXlsxBuffer(file.buffer);
  }
}

function processCsvBuffer(buffer) {
  const content = buffer.toString("utf8");

  const records = parseCsv(content, {
    bom: true,
    columns: false,
    skip_empty_lines: false,
    relax_column_count: true,
    relax_quotes: true,
    relax_column_count_less: true,
    relax_column_count_more: true,
    relax: true,
    trim: false,
    ltrim: false,
    rtrim: false,
    quote: null,
    escape: null,
    skip_records_with_error: false,
  });

  if (!records.length) {
    throw new Error("Üres CSV fájl.");
  }

  const headers = records[0];
  const rows = records.slice(1);

  return {
    type: "csv",
    headers,
    rows,
    rowCount: rows.length,
  };
}

function processXlsxBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
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
