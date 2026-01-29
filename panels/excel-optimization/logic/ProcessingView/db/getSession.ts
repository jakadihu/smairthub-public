"use server";

import { db } from "../../../db";
import { excelSessions } from "../../../db/schema/session";
import { eq } from "drizzle-orm";

export async function getSession(sessionId: string) {
  const rows = await db
    .select()
    .from(excelSessions)
    .where(eq(excelSessions.id, sessionId))
    .limit(1);
  return rows[0] ?? null;
}
