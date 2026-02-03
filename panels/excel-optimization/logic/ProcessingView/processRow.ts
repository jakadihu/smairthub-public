// processRow.ts

export interface CellIssue {
  type: "missing" | "invalid_type" | "format_error";
  severity: "info" | "warning" | "error";
  message: string;
}

export interface CellResult {
  original: string | number | boolean | null;
  normalized: string | number | boolean | null;
  issues: CellIssue[];
}

export interface ProcessedRow {
  index: number;
  original: any;
  cells: Record<string, CellResult>;
  hasError: boolean;
  hasWarning: boolean;
  hasInfo: boolean;
  hasDuplicate: boolean;
  normalizedKey: string;
}

export function processRow(
  row: any,
  headers: string[],
  types: Record<string, string>,
  index: number,
  contentColumns: string[],
): ProcessedRow {
  const cells: Record<string, CellResult> = {};
  let hasError = false;
  let hasWarning = false;
  let hasInfo = false;

  for (const header of headers) {
    const expectedType = types[header];
    const rawValue = row[header];

    const cell = validateAndNormalizeCell(rawValue, expectedType);

    // Sor szintű állapot meghatározása
    if (cell.issues.some((i) => i.severity === "error")) {
      hasError = true;
    }
    if (cell.issues.some((i) => i.severity === "warning")) {
      hasWarning = true;
    }
    if (cell.issues.some((i) => i.severity === "info")) {
      hasInfo = true;
    }

    cells[header] = cell;
  }

  const normalizedKey = JSON.stringify(
    Object.fromEntries(
      Object.entries(cells)
        .filter(([h]) => contentColumns.includes(h))
        .map(([h, c]) => [h, c.normalized]),
    ),
  );

  return {
    index,
    original: row,
    cells,
    hasError,
    hasWarning,
    hasInfo,
    hasDuplicate: false,
    normalizedKey,
  };
}

// ------------------------------------------------------------
// Cell-validáció és normalizálás
// ------------------------------------------------------------

function validateAndNormalizeCell(
  rawValue: any,
  expectedType: string,
): CellResult {
  const issues: CellIssue[] = [];

  // 1) Üres cella → warning
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    issues.push({
      type: "missing",
      severity: "warning",
      message: "A cella üres.",
    });

    return {
      original: rawValue,
      normalized: null,
      issues,
    };
  }

  // 2) Trim
  let value = String(rawValue).trim();

  if (String(rawValue) !== value) {
    issues.push({
      type: "format_error",
      severity: "info",
      message: "A cella elején vagy végén whitespace volt, eltávolítva.",
    });
  }

  if (value === "") {
    issues.push({
      type: "missing",
      severity: "warning",
      message: "A cella csak whitespace karaktereket tartalmazott.",
    });

    return {
      original: rawValue,
      normalized: null,
      issues,
    };
  }

  // 3) Típus-specifikus validáció
  switch (expectedType) {
    case "string":
      return validateString(value, rawValue, issues);

    case "number":
      return validateNumber(value, rawValue, issues);

    case "boolean":
      return validateBoolean(value, rawValue, issues);

    case "date":
      return validateDate(value, rawValue, issues);

    case "email":
      return validateEmail(value, rawValue, issues);

    case "phone":
      return validatePhone(value, rawValue, issues);

    default:
      issues.push({
        type: "invalid_type",
        severity: "error",
        message: `Ismeretlen típus: ${expectedType}`,
      });

      return {
        original: rawValue,
        normalized: null,
        issues,
      };
  }
}

// ------------------------------------------------------------
// Validátorok
// ------------------------------------------------------------

function validateString(
  value: string,
  original: any,
  issues: CellIssue[],
): CellResult {
  return {
    original,
    normalized: value,
    issues,
  };
}

function validateNumber(
  value: string,
  original: any,
  issues: CellIssue[],
): CellResult {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const num = Number(normalized);

  if (normalized !== value) {
    issues.push({
      type: "format_error",
      severity: "info",
      message: "A szám formátuma normalizálva lett.",
    });
  }

  if (isNaN(num)) {
    issues.push({
      type: "format_error",
      severity: "error",
      message: "A szám formátuma érvénytelen.",
    });

    return {
      original,
      normalized: null,
      issues,
    };
  }

  return {
    original,
    normalized: num,
    issues,
  };
}

function validateBoolean(
  value: string,
  original: any,
  issues: CellIssue[],
): CellResult {
  const v = value.toLowerCase();

  if (["true", "yes", "y", "1", "igen"].includes(v)) {
    return { original, normalized: true, issues };
  }

  if (["false", "no", "n", "0", "nem"].includes(v)) {
    return { original, normalized: false, issues };
  }

  issues.push({
    type: "format_error",
    severity: "error",
    message: "A logikai érték nem felismerhető.",
  });

  return {
    original,
    normalized: null,
    issues,
  };
}

function validateDate(
  value: string,
  original: any,
  issues: CellIssue[],
): CellResult {
  const iso = new Date(value);

  if (isNaN(iso.getTime())) {
    issues.push({
      type: "format_error",
      severity: "error",
      message: "A dátum formátuma érvénytelen.",
    });

    return {
      original,
      normalized: null,
      issues,
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    issues.push({
      type: "format_error",
      severity: "info",
      message: "A dátum formátuma felismerhető, de nem ISO.",
    });
  }

  // FONTOS: nem normalizálunk ISO-ra automatikusan
  return {
    original,
    normalized: value,
    issues,
  };
}

function validateEmail(
  value: string,
  original: any,
  issues: CellIssue[],
): CellResult {
  const trimmed = value.trim();
  // Whitespace → INFO
  if (trimmed !== value) {
    issues.push({
      type: "format_error",
      severity: "info",
      message: "A felesleges whitespace eltávolításra került.",
    });
  }

  // Lowercase normalizálás → INFO
  if (trimmed.toLowerCase() !== trimmed) {
    issues.push({
      type: "format_error",
      severity: "info",
      message: "Az e-mail cím kisbetűsre normalizálva.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    issues.push({
      type: "format_error",
      severity: "error",
      message: "Az e-mail cím formátuma érvénytelen.",
    });

    return {
      original,
      normalized: null,
      issues,
    };
  }

  return {
    original,
    normalized: value.toLowerCase(),
    issues,
  };
}

function validatePhone(
  value: string,
  original: any,
  issues: CellIssue[],
): CellResult {
  const digits = value.replace(/\D/g, "");

  if (digits !== value) {
    issues.push({
      type: "format_error",
      severity: "info",
      message: "A telefonszám normalizálható.",
    });
  }

  if (digits.length < 7) {
    issues.push({
      type: "format_error",
      severity: "error",
      message: "A telefonszám túl rövid.",
    });

    return {
      original,
      normalized: null,
      issues,
    };
  }

  return {
    original,
    normalized: value,
    issues,
  };
}
