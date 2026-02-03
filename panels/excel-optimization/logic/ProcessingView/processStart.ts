"use server";

import { processRow } from "./processRow";
import { processSession } from "./db/processSession";
import { updateProgress } from "./db/updateProgress";
import { db } from "../../db";
import { excelSessions } from "../../db/schema/session";
import { excelSessionRows } from "../../db/schema/sessionRow";
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
    await updateProgress(sessionId, {
      status: "error",
      error: "A JSON fájl nem tölthető le.",
      progress: 0,
    });
    return;
  }

  const rows = await res.json();

  // Tartalmi mezők detektálása
  const columnValues: Record<string, Set<string>> = {};
  for (const header of headers) {
    columnValues[header] = new Set();
  }
  for (const row of rows) {
    for (const header of headers) {
      const value = row[header];
      columnValues[header].add(String(value ?? ""));
    }
  }
  // Tartalmi mezők = ahol NEM minden sor egyedi
  const contentColumns = headers.filter(
    (h) => columnValues[h].size < rows.length,
  );

  console.log(contentColumns);

  const total = rows.length;
  const startTime = Date.now();

  try {
    for (let i = 0; i < total; i++) {
      const row = rows[i];

      // sor feldolgozása
      const result = processRow(row, headers, types, i, contentColumns);

      // duplikáció keresése
      const existing = await db
        .select()
        .from(excelSessionRows)
        .where(eq(excelSessionRows.normalizedKey, result.normalizedKey))
        .limit(1);

      if (existing.length > 0) {
        result.hasDuplicate = true;
        // korábbi sor jelölése is
        if (!existing[0].hasDuplicate) {
          await db
            .update(excelSessionRows)
            .set({ hasDuplicate: 1 })
            .where(eq(excelSessionRows.id, existing[0].id));
        }
      }

      // DB-be írás
      await processSession({
        sessionId,
        headers,
        rows: [result],
        duration: 0,
      });

      // progress frissítése
      const progress = Math.round(((i + 1) / total) * 100);

      await updateProgress(sessionId, {
        progress,
        status: "running",
        error: null,
      });
    }

    // kész — státusz + progress + duration
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
    // hiba esetén session státusz: error
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
    // JSON törlése
    await fetch(`${API}/file/json/${jsonId}`, {
      method: "DELETE",
    }).catch(() => {});
  }
}
