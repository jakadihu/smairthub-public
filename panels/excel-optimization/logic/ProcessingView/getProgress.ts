"use server";

import { db } from "../../db";
import { excelSessions } from "../../db/schema/session";
import { eq } from "drizzle-orm";

export async function getProgress(sessionId: string) {
  const rows = await db
    .select()
    .from(excelSessions)
    .where(eq(excelSessions.id, sessionId))
    .limit(1);

  const session = rows[0];

  if (!session) {
    return {
      status: "error",
      progress: 0,
      error: "Session not found",
    };
  }

  return {
    status: session.status,      // "pending" | "running" | "done" | "error"
    progress: session.progress,  // 0–100
    error: session.error,        // string | null
    duration: session.duration,  // string
    updatedAt: session.updatedAt // timestamp
  };
}
