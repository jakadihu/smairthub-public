"use server";

import { db } from "../db";
import { excelSessionRows } from "../db/schema/sessionRow";
import { eq } from "drizzle-orm";

export async function getSessionRows(sessionId: string) {
  return db
    .select()
    .from(excelSessionRows)
    .where(eq(excelSessionRows.sessionId, sessionId))
    .orderBy(excelSessionRows.rowIndex);
}
