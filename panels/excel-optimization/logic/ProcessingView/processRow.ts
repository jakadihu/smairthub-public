// processRow.ts
// A teljes sor-validáció és normalizálás itt történik.

export interface CellIssue {
  type: string;
  severity: "warning" | "danger";
  message: string;
}

export interface CellResult {
  normalized: string | number | boolean | null;
  issues: CellIssue[];
  score: number; // 0–100
}

export interface ProcessedRow {
  index: number;
  success: boolean;
  errorMessage: string | null;
  original: any;
  normalized: Record<string, CellResult> | null;
  rowScore: number; // 0–100
  rowStatus: "ok" | "warning" | "danger";
}

export function processRow(
  row: any,
  headers: string[],
  types: Record<string, string>,
  index: number,
): ProcessedRow {
  try {
    const normalizedRow: Record<string, CellResult> = {};
    let totalScore = 0;
    let totalCells = 0;    

    for (const header of headers) {
      const expectedType = types[header];
      const rawValue = row[header];      

      const cell = validateAndNormalizeCell(rawValue, expectedType);      
      normalizedRow[header] = cell;

      totalScore += cell.score;
      totalCells += 1;
    }

    const rowScore = totalCells > 0 ? Math.round(totalScore / totalCells) : 100;

    const rowStatus =
      rowScore >= 90 ? "ok" : rowScore >= 60 ? "warning" : "danger";

    return {
      index,
      success: true,
      errorMessage: null,
      original: row,
      normalized: normalizedRow,
      rowScore,
      rowStatus,
    };
  } catch (err: any) {
    return {
      index,
      success: false,
      errorMessage: err?.message || "Unknown error",
      original: row,
      normalized: null,
      rowScore: 0,
      rowStatus: "danger",
    };
  }
}

function validateAndNormalizeCell(
  rawValue: any,
  expectedType: string,
): CellResult {
  const issues: CellIssue[] = [];

  // 1) Presence check
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    issues.push({
      type: "missing_value",
      severity: "warning",
      message: "A cella üres.",
    });

    return {
      normalized: null,
      issues,
      score: 60,
    };
  }

  // Convert to string for processing
  let value = String(rawValue).trim();

  if (value === "") {
    issues.push({
      type: "empty_after_trim",
      severity: "warning",
      message: "A cella csak whitespace karaktereket tartalmazott.",
    });

    return {
      normalized: null,
      issues,
      score: 60,
    };
  }

  // 2) Type-specific validation
  switch (expectedType) {
    case "string":
      return validateString(value, issues);

    case "number":
      return validateNumber(value, issues);

    case "boolean":
      return validateBoolean(value, issues);

    case "date":
      return validateDate(value, issues);

    case "email":
      return validateEmail(value, issues);

    case "phone":
      return validatePhone(value, issues);

    default:
      issues.push({
        type: "unknown_type",
        severity: "danger",
        message: `Ismeretlen típus: ${expectedType}`,
      });
      return {
        normalized: value,
        issues,
        score: 0,
      };
  }
}

function validateString(value: string, issues: CellIssue[]): CellResult {
  return {
    normalized: value,
    issues,
    score: 100,
  };
}

function validateNumber(value: string, issues: CellIssue[]): CellResult {
  const normalized = value.replace(/\s/g, "").replace(",", ".");

  const num = Number(normalized);

  if (isNaN(num)) {
    issues.push({
      type: "invalid_number",
      severity: "danger",
      message: "A szám formátuma érvénytelen.",
    });

    return {
      normalized: null,
      issues,
      score: 20,
    };
  }

  return {
    normalized: num,
    issues,
    score: 100,
  };
}

function validateBoolean(value: string, issues: CellIssue[]): CellResult {
  const v = value.toLowerCase();

  if (["true", "yes", "y", "1", "igen"].includes(v)) {
    return { normalized: true, issues, score: 100 };
  }

  if (["false", "no", "n", "0", "nem"].includes(v)) {
    return { normalized: false, issues, score: 100 };
  }

  issues.push({
    type: "invalid_boolean",
    severity: "danger",
    message: "A logikai érték nem felismerhető.",
  });

  return {
    normalized: null,
    issues,
    score: 20,
  };
}

function validateDate(value: string, issues: CellIssue[]): CellResult {
  const iso = new Date(value);

  if (isNaN(iso.getTime())) {
    issues.push({
      type: "invalid_date",
      severity: "danger",
      message: "A dátum formátuma érvénytelen.",
    });

    return {
      normalized: null,
      issues,
      score: 20,
    };
  }

  return {
    normalized: iso.toISOString(),
    issues,
    score: 100,
  };
}

function validateEmail(value: string, issues: CellIssue[]): CellResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    issues.push({
      type: "invalid_email",
      severity: "danger",
      message: "Az e-mail cím formátuma érvénytelen.",
    });

    return {
      normalized: null,
      issues,
      score: 20,
    };
  }

  return {
    normalized: value.toLowerCase(),
    issues,
    score: 100,
  };
}

function validatePhone(value: string, issues: CellIssue[]): CellResult {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 7) {
    issues.push({
      type: "invalid_phone",
      severity: "danger",
      message: "A telefonszám túl rövid.",
    });

    return {
      normalized: null,
      issues,
      score: 20,
    };
  }

  return {
    normalized: "+" + digits,
    issues,
    score: 100,
  };
}
