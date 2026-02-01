"use server";

import { processStart } from "./processStart";

export async function startProcessing(args: { sessionId: string; jsonId: string; headers: any[]; types: Record<string, string>; }) {
  return processStart(args);
}
