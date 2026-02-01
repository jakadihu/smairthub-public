"use server";

import { createSession } from "./db/createSession";
import { processStart } from "./ProcessingView/processStart";

export async function createSessionAndStart({
  jsonId,
  headers,
  types,
}: {
  jsonId: string;
  headers: string[];
  types: Record<string, string>;
}) {
  const { sessionId } = await createSession();

  processStart({
    sessionId,
    jsonId,
    headers,
    types,
  });

  return { sessionId };
}
