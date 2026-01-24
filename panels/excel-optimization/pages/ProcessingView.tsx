"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@packages/ui/button";
import { Progress } from "@packages/ui/progress";
import { ArrowLeft } from "lucide-react";
import { processBatch } from "../logic/processBatch";

// --- CONFIG --- //
const CONCURRENCY = 8;
const BATCH_SIZE = 5;

export default function ProcessingView({
  headers,
  types,
  rows,
  onBack,
  onComplete,
}: {
  headers: string[];
  types: Record<string, string>;
  rows: any[];
  onBack: () => void;
  onComplete: (result: any) => void;
}) {
  const processedRef = useRef<any[]>([]);
  const cancelledRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const currentOpRef = useRef(0);
  const totalOpsRef = useRef(0);

  const [done, setDone] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    console.log("%c[ProcessingView] useEffect START", "color:#ffaa00");
    let active = true;
    cancelledRef.current = false;

    async function run() {
      console.log("%c[RUN] START", "color:#ffaa00");

      processedRef.current = [];
      currentOpRef.current = 0;
      setProgress(0);

      startTimeRef.current = Date.now();
      setEndTime(null);

      const totalRows = rows.length;
      console.log("%c[RUN] totalRows = " + totalRows, "color:#ffaa00");

      if (totalRows === 0) return;

      // --- FIXED CHUNKING --- //
      console.log(
        `%c[CHUNK] Creating chunks with batchSize=${BATCH_SIZE}`,
        "color:#33ccff"
      );

      const chunks: any[][] = [];
      for (let i = 0; i < totalRows; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE);
        chunks.push(chunk);
        console.log(
          `%c[CHUNK] Created chunk ${chunks.length - 1} (size=${chunk.length})`,
          "color:#33ccff"
        );
      }

      const concurrency = Math.min(CONCURRENCY, chunks.length);
      console.log(
        `%c[RUN] Using concurrency=${concurrency}`,
        "color:#33ccff"
      );

      // progress = 2 ops per chunk (BE + KI)
      totalOpsRef.current = chunks.length * 2;
      console.log(
        `%c[RUN] totalOps = ${totalOpsRef.current}`,
        "color:#ffaa00"
      );

      // --- DISTRIBUTE CHUNKS --- //
      const workerChunks: any[][][] = Array.from(
        { length: concurrency },
        () => []
      );

      chunks.forEach((chunk, i) => {
        workerChunks[i % concurrency].push(chunk);
      });

      console.log("%c[WORKERS] Distribution:", "color:#33ccff", workerChunks);

      // --- WORKER --- //
      async function worker(chunksForThisWorker: any[][], workerIndex: number) {
        console.log(
          `%c[WORKER ${workerIndex}] START (${chunksForThisWorker.length} chunks)`,
          "color:#00aaff"
        );

        for (let ci = 0; ci < chunksForThisWorker.length; ci++) {
          if (!active || cancelledRef.current) {
            console.log(
              `%c[WORKER ${workerIndex}] CANCELLED`,
              "color:red"
            );
            return;
          }

          const chunk = chunksForThisWorker[ci];
          console.log(
            `%c[WORKER ${workerIndex}] Processing chunk ${ci} (size=${chunk.length})`,
            "color:#00aaff"
          );

          // --- BE --- //
          currentOpRef.current += 1;
          setProgress((currentOpRef.current / totalOpsRef.current) * 100);
          console.log(
            `%c[PROGRESS] BE → ${(
              (currentOpRef.current / totalOpsRef.current) *
              100
            ).toFixed(2)}%`,
            "color:#33cc33"
          );

          const result = await processBatch(chunk, headers, types);

          // --- KI --- //
          currentOpRef.current += 1;
          setProgress((currentOpRef.current / totalOpsRef.current) * 100);
          console.log(
            `%c[PROGRESS] KI → ${(
              (currentOpRef.current / totalOpsRef.current) *
              100
            ).toFixed(2)}%`,
            "color:#33cc33"
          );

          processedRef.current.push(...result);

          console.log(
            `%c[WORKER ${workerIndex}] Chunk ${ci} DONE`,
            "color:#00cc88"
          );
        }

        console.log(
          `%c[WORKER ${workerIndex}] ALL CHUNKS DONE`,
          "color:#00cc88"
        );
      }

      const workers = workerChunks.map((c, i) => worker(c, i));
      console.log(
        "%c[RUN] Workers started: " + workers.length,
        "color:#ffaa00"
      );

      await Promise.all(workers);

      if (active && !cancelledRef.current) {
        const end = Date.now();
        setEndTime(end);
        setDone(true);

        console.log(
          `%c[RUN] COMPLETE. Duration = ${
            (end - startTimeRef.current!) / 1000
          }s`,
          "color:#00cc88"
        );

        onComplete({
          headers,
          rows: processedRef.current,
          duration: (end - startTimeRef.current!) / 1000,
        });
      }
    }

    run();

    return () => {
      console.log("%c[ProcessingView] CLEANUP", "color:#ffaa00");
      active = false;
      cancelledRef.current = true;
    };
  }, [rows, headers, types, onComplete]);

  const duration =
    startTimeRef.current && endTime
      ? ((endTime - startTimeRef.current) / 1000).toFixed(2)
      : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza
        </Button>

        {!done && (
          <Button
            variant="destructive"
            onClick={() => {
              console.log("%c[RUN] CANCEL REQUESTED", "color:red");
              cancelledRef.current = true;
            }}
          >
            Megszakítás
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 mt-6">
        <Progress value={progress} className="w-full" />

        {!done && !cancelledRef.current && (
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% kész
          </p>
        )}

        {cancelledRef.current && (
          <p className="text-red-600 font-medium">Feldolgozás megszakítva.</p>
        )}

        {done && (
          <>
            <p className="text-green-600 font-medium">Feldolgozás kész!</p>
            {duration && (
              <p className="text-sm text-muted-foreground">
                Feldolgozási idő: {duration} másodperc
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
