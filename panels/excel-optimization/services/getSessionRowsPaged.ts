"use server";

import { db } from "../db";
import { excelSessionRows } from "../db/schema/sessionRow";
import { excelSessionIssues } from "../db/schema/sessionIssues";
import { eq, inArray,sql } from "drizzle-orm";

export async function getSessionRowsPaged(
  sessionId: string,
  page: number,
  pageSize: number
) {
  const offset = (page - 1) * pageSize;

  // 1) lekérjük az adott oldal sorait
  const rows = await db
    .select()
    .from(excelSessionRows)
    .where(eq(excelSessionRows.sessionId, sessionId))
    .orderBy(excelSessionRows.rowIndex)
    .limit(pageSize)
    .offset(offset);

  // ha nincs sor, nincs issue sem
  if (rows.length === 0) {
    return {
      rows: [],
      total: 0,
      totalPages: 1,
    };
  }

  // 2) lekérjük az adott sorokhoz tartozó issue‑kat
  const rowIds = rows.map((r) => r.id);

  const issues = await db
    .select()
    .from(excelSessionIssues)
    .where(inArray(excelSessionIssues.rowId, rowIds));

  // 3) issue‑k sorokhoz rendezése
  const issuesByRow: Record<string, any[]> = {};
  for (const issue of issues) {
    if (!issuesByRow[issue.rowId]) issuesByRow[issue.rowId] = [];
    issuesByRow[issue.rowId].push(issue);
  }

  // 4) sorok összeállítása
  const merged = rows.map((r) => ({
    ...r,
    issues: issuesByRow[r.id] ?? [],
  }));

  // 5) total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(excelSessionRows)
    .where(eq(excelSessionRows.sessionId, sessionId));

  return {
    rows: merged,
    total: Number(count),
    totalPages: Math.ceil(Number(count) / pageSize),
  };
}
