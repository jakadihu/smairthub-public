export function inferScoreFromErrors(errors: any[]): number {
  if (!Array.isArray(errors) || errors.length === 0) return 100;

  const hasHardError = errors.some(
    (e) =>
      e.type === "type" ||
      e.type === "integrity" ||
      e.type === "duplicate"
  );

  if (hasHardError) return 40;

  const hasWarning = errors.some(
    (e) => e.type === "typo" || e.type === "range" || e.type === "format"
  );

  if (hasWarning) return 80;

  return 100;
}
