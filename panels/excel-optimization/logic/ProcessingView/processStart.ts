"use server";

import fs from "fs/promises";
import path from "path";
import { processRow } from "./processRow";
import { processSession } from "./db/processSession";
import { updateProgress } from "./db/updateProgress";
import { db } from "../../db";
import { excelSessions } from "../../db/schema/session";
import { eq } from "drizzle-orm";

export async function processStart({
  sessionId,
  jsonId,
  headers,
  types,
}: {
  sessionId: string;
  jsonId: string;
  headers: any[];
  types: Record<string, string>;
}) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  // 1) session státusz: running
  await db
    .update(excelSessions)
    .set({
      status: "running",
      progress: 0,
      error: null,
      updatedAt: new Date(),
    })
    .where(eq(excelSessions.id, sessionId));

  // 2) JSON betöltése  
  const res = await fetch(`${API}/file/json/${jsonId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // ha nem oké → hiba
  if (!res.ok) {
    console.log("JSON letöltése sikertelen");
    //throw new Error("JSON letöltése sikertelen");
  }

  const rows = await res.json();

  const total = rows.length;
  const startTime = Date.now();

  try {
    for (let i = 0; i < total; i++) {
      const row = rows[i];

      // 3) sor feldolgozása
      const result = processRow(row, headers, types, i);      

      // 4) DB-be írás
      await processSession({
        sessionId,
        headers,
        rows: [result],
        duration: 0,
      });

      // 5) progress frissítése
      const progress = Math.round(((i + 1) / total) * 100);      
      

      await updateProgress(sessionId, {
        progress,
        done: false,
        error: null,
      });
    }

    // 6) kész — státusz + progress + duration
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    await db
      .update(excelSessions)
      .set({
        status: "done",
        progress: 100,
        duration: durationSec,
        updatedAt: new Date(),
      })
      .where(eq(excelSessions.id, sessionId));
  } catch (err: any) {
    // 7) hiba esetén session státusz: error
    await db
      .update(excelSessions)
      .set({
        status: "error",
        error: err.message,
        updatedAt: new Date(),
      })
      .where(eq(excelSessions.id, sessionId));

    throw err;
  } finally {
    // 8) JSON törlése
    await fetch(`${API}/file/json/${jsonId}`, {
      method: "DELETE",
    }).catch(() => {});
  }
}
