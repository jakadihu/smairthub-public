import pLimit from "p-limit";
import { validateRow } from "./validateRow";
import { findDuplicates } from "./findDuplicates";
import { sendProgressEvent } from "../services/progress"; 
// panel-oldali SSE wrapper
// pl. sendProgressEvent({ current, total })

import { cancelFlag } from "../state/cancelState.js"; 
// panel-oldali cancel flag (nem API!)

export interface BatchResultItem {
  index: number;
  original: Record<string, any>;
  success: boolean;
  cancelled?: boolean;
  error?: boolean;
  errorMessage?: string;
  result?: any;
}

export interface BatchValidationResult {
  rows: BatchResultItem[];
  summary: any;
}

/**
 * A panel teljes batch validációs motorja.
 * - párhuzamos futtatás pLimit-tel
 * - cancel figyelés
 * - progress küldés SSE-n
 * - validateRow meghívása minden sorra
 */
export async function validateBatch(
  headers: string[],
  rows: Record<string, any>[]
): Promise<BatchValidationResult> {
  const limit = pLimit(20);
  const total = rows.length;
  let completed = 0;

  // duplikációk előzetes kiszámítása
  const duplicateKeys = findDuplicates(rows, ["email", "id"]);

  const tasks = rows.map((row, index) =>
    limit(async () => {
      // cancel check
      if (cancelFlag.active) {
        completed++;
        sendProgressEvent({ current: completed, total });

        return {
          index,
          original: row,
          success: false,
          cancelled: true,
        };
      }

      try {
        const result = await validateRow(headers, row, duplicateKeys);

        completed++;
        sendProgressEvent({ current: completed, total });

        return {
          index,
          original: row,
          success: true,
          result,
        };
      } catch (err: any) {
        completed++;
        sendProgressEvent({ current: completed, total });

        return {
          index,
          original: row,
          success: false,
          error: true,
          errorMessage: err?.message || "Row validation error",
        };
      }
    })
  );

  const results = await Promise.all(tasks);

  return {
    rows: results,
    summary: buildBatchSummary(results),
  };
}

/**
 * Egyszerű összegzés a batch eredményeiből.
 * (Külön fájlba is tehetjük, de itt is maradhat.)
 */
function buildBatchSummary(results: BatchResultItem[]) {
  const total = results.length;
  const success = results.filter((r) => r.success).length;
  const failed = results.filter((r) => r.error).length;
  const cancelled = results.filter((r) => r.cancelled).length;

  return {
    total,
    success,
    failed,
    cancelled,
  };
}
