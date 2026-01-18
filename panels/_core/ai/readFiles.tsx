import * as XLSX from "xlsx"

export interface ParsedFile {
  sheets: string[]
  rows: string[][]
}

// BOM eltávolítása
function stripBOM(text: string) {
  return text.replace(/^\uFEFF/, "")
}

// delimiter felismerése
function detectDelimiter(line: string): string {
  const delimiters = [",", ";", "|", "\t"]
  const scores = delimiters.map((d) => ({
    d,
    count: line.split(d).length,
  }))
  return scores.sort((a, b) => b.count - a.count)[0].d
}

// profi CSV sor feldolgozó
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && next === '"') {
      // escaped idézőjel: ""
      current += '"'
      i++
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  result.push(current.trim())
  return result
}


function decodeBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  // UTF-8 BOM
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(buffer)
  }

  // UTF-16 LE BOM
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer)
  }

  // UTF-16 BE BOM
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer)
  }

  // Próbáljuk meg UTF-8-ként
  let utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buffer)

  // Ha sok hibás karakter van → valószínűleg Windows-1250
  const replacementCount = (utf8.match(/\uFFFD/g) || []).length
  if (replacementCount > 5) {
    return new TextDecoder("windows-1250").decode(buffer)
  }

  return utf8
}





export async function readFileToRows(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()

  // CSV
  if (file.name.endsWith(".csv")) {
    const text = decodeBuffer(buffer)    

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    const firstLine = lines[0] ?? ""
    const delimiter = detectDelimiter(firstLine)

    const rows = lines.map((line) => parseCsvLine(line, delimiter))

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
