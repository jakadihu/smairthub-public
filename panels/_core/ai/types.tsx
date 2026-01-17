export type DetectedColumnType =
  | "string"
  | "number"
  | "integer"
  | "date"
  | "datetime"
  | "boolean"
  | "email"
  | "name"
  | "address"
  | "phone"
  | "tax_id"
  | "iban"
  | "currency"
  | "id"
  | "category"
  | "status"

export interface DetectedHeader {
  rowIndex: number
  originalLabels: string[]
  suggestedLabels: string[]
}

export interface DetectedColumn {
  index: number
  originalLabel: string | null
  suggestedLabel: string
  type: DetectedColumnType
  confidence: number
}

export interface DataAnomaly {
  rowIndex: number
  columnIndex: number
  reason: string
  severity: "info" | "warning" | "error"
}

export interface DataProfile {
  rowCount: number
  columnCount: number
  missingValues: number
  duplicateRows: number
}

export interface AIAnalysisResult {
  header: DetectedHeader
  columns: DetectedColumn[]
  anomalies: DataAnomaly[]
  profile: DataProfile
}
