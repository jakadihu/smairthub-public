// logic/runProcessingJob.ts
import { db } from "../../db";
import { excelSessions } from "../../db/schema/session";
import { excelSessionRows } from "../../db/schema/sessionRow";
import { processRow } from "./processRow";
import { eq } from "drizzle-orm";

export async function runProcessingJob(sessionId: string) {
  // session meta
  const session = await db.query.excelSessions.findFirst({
    where: eq(excelSessions.id, sessionId),
  });

  if (!session) return;

  // nyers sorok
  const rows = await db.query.excelSessionRows.findMany({
    where: eq(excelSessionRows.sessionId, sessionId),
    orderBy: excelSessionRows.rowIndex,
  });

  const total = rows.length;
  const start = Date.now();

  // státusz: processing
  await db.update(excelSessions)
    .set({ status: "processing", progress: 0 })
    .where(eq(excelSessions.id, sessionId));

  for (let i = 0; i < total; i++) {
    const row = rows[i];

    const result = processRow(
      row.original,
      session.headers,
      session.types,
      i
    );

    // eredmény mentése
    await db.update(excelSessionRows)
      .set({
        normalized: result.normalized,
        rowScore: result.rowScore,
        rowStatus: result.rowStatus,
        errorMessage: result.errorMessage,
      })
      .where(eq(excelSessionRows.id, row.id));

    // progress mentése
    await db.update(excelSessions)
      .set({ progress: (i + 1) / total })
      .where(eq(excelSessions.id, sessionId));
  }

  const end = Date.now();
  const duration = ((end - start) / 1000).toFixed(2);

  // végső státusz
  await db.update(excelSessions)
    .set({
      status: "done",
      progress: 1,
      duration,
    })
    .where(eq(excelSessions.id, sessionId));
}
