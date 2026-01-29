"use server";

import { db } from "../../../db";
import { excelSessionIssues } from "../../../db/schema/sessionIssues";
import { eq } from "drizzle-orm";

export async function getSessionIssues(sessionId: string) {
  return db
    .select()
    .from(excelSessionIssues)
    .where(eq(excelSessionIssues.sessionId, sessionId));
}
