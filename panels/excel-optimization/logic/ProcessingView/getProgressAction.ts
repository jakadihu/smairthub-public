"use server";

import { getProgress } from "./getProgress";

export async function getProgressAction(sessionId: string) {
  return getProgress(sessionId);
}
