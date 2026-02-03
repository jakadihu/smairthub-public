"use server";

import { db } from "../../../db";
import { excelSessions } from "../../../db/schema/session";
import { excelSessionRows } from "../../../db/schema/sessionRow";
import { excelSessionIssues } from "../../../db/schema/sessionIssues";
import { eq } from "drizzle-orm";
import { CellResult } from "../processRow";

export async function processSession({
  sessionId,
  headers,
  rows,
  duration,
}: {
  sessionId: string;
  headers: string[];
  rows: any[];
  duration: number;
}) {
  // 1) Session frissítése
  await db
    .update(excelSessions)
    .set({ duration: String(duration) })
    .where(eq(excelSessions.id, sessionId));

  // 2) Sorok beszúrása
  for (const row of rows) {
    const rowId = crypto.randomUUID();

    await db.insert(excelSessionRows).values({
      id: rowId,
      sessionId,
      rowIndex: row.index,
      original: row.original,
      normalized: row.cells,
      hasError: row.hasError ? 1 : 0,
      hasWarning: row.hasWarning ? 1 : 0,
      hasInfo: row.hasInfo ? 1 : 0,
      hasDuplicate: row.hasDuplicate? 1 : 0,
      normalizedKey: row.normalizedKey,
    });

    // 3) Hibák beszúrása
    for (const [header, cell] of Object.entries(row.cells) as [
      string,
      CellResult,
    ][]) {
      for (const issue of cell.issues) {
        await db.insert(excelSessionIssues).values({
          id: crypto.randomUUID(),
          sessionId,
          rowId,
          header,
          issueType: issue.type,
          severity: issue.severity,
          message: issue.message,
        });
      }
    }
  }

  return { ok: true };
}
