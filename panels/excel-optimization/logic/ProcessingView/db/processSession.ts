"use server";

import { db } from "../../../db";
import { excelSessions } from "../../../db/schema/session";
import { excelSessionRows } from "../../../db/schema/sessionRow";
import { excelSessionIssues } from "../../../db/schema/sessionIssues";
import { eq } from "drizzle-orm";

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
      rowScore: row.rowScore,
      rowStatus: row.rowStatus,
      original: row.original,
      normalized: row.normalized,
    });

    type NormalizedIssue = { type: string; severity: string; message: string };
    type NormalizedCell = {
      value: string | number | null;
      issues: NormalizedIssue[];
    };


    // 3) Hibák beszúrása
    if (row.normalized) {
      for (const [header, cell] of Object.entries(row.normalized) as [
        string,
        NormalizedCell,
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
  }

  return { ok: true };
}
