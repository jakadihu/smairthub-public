import * as XLSX from "xlsx"

export interface ParsedFile {
  sheets: string[]
  rows: string[][]
}

export async function readFileToRows(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()

  // CSV
  if (file.name.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer)
    const rows = text
      .split("\n")
      .map((line) => line.split(",").map((c) => c.trim()))

    return {
      sheets: ["CSV"],
      rows,
    }
  }

  // XLSX / XLS
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetNames = workbook.SheetNames

  const firstSheet = workbook.Sheets[sheetNames[0]]
  const rows: string[][] = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    raw: false,
  })

  return {
    sheets: sheetNames,
    rows,
  }
}
