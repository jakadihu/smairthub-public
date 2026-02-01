"use server";

import { db } from "../../../db";
import { excelSessions } from "../../../db/schema/session";
import { eq } from "drizzle-orm";

export async function updateProgress(
  sessionId: string,
  state: {
    progress: number;
    done: boolean;
    error: string | null;
  },
) {
  await db
    .update(excelSessions)
    .set({
      progress: state.progress,
      status: state.done ? "done" : "running",
      error: state.error,
      updatedAt: new Date(),
    })
    .where(eq(excelSessions.id, sessionId));
}
