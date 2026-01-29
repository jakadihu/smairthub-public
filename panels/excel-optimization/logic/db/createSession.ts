"use server";

import { db } from "../../db";
import { excelSessions } from "../../db/schema/session";

export async function createSession() {
  const id = crypto.randomUUID();

  try {
    await db.insert(excelSessions).values({
      id,
      duration: "",
    });

    return { sessionId: id };
  } catch (err) {
    throw err;
  }
}
