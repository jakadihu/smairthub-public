"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@packages/ui/button";
import { Progress } from "@packages/ui/progress";
import { ArrowLeft } from "lucide-react";
import { processRow } from "../../logic/ProcessingView/processRow";
import { processSession } from "../../logic/ProcessingView/db/processSession";

interface ProcessedRow {
  index: number;
  success: boolean;
  errorMessage: string | null;
  original: any;
  normalized: Record<string, any> | null;
  rowScore: number;
  rowStatus: "ok" | "warning" | "danger";
}

export default function ProcessingView({
  sessionId,
  headers,
  types,
  rows,
  jsonId,
  onBack,
  onComplete,
}: {
  sessionId: string;
  headers: string[];
  types: Record<string, string>;
  rows: any[];
  jsonId: any[];
  onBack: () => void;
  onComplete: () => void;
}) {
  const cancelledRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);

  // 🔥 Ez a kulcs: explicit trigger, nem mount
  const [started, setStarted] = useState(false);

  // 🔥 A mount után egyszer aktiváljuk a feldolgozást
  useEffect(() => {
    setStarted(true);
  }, []);

  // 🔥 A feldolgozás csak akkor indul el, ha started = true
  useEffect(() => {
    if (!started) return;    

    let active = true;
    cancelledRef.current = false;

    async function run() {
      const total = rows.length;
      const processed: ProcessedRow[] = [];

      startTimeRef.current = Date.now();
      setProgress(0);
      setDone(false);
      setEndTime(null);

      for (let i = 0; i < total; i++) {
        if (!active || cancelledRef.current) break;

        const duration = 0;

        const row = rows[i];
        const result = processRow(row, headers, types, i);
        await processSession({
          sessionId,
          headers,
          rows: [result],
          duration,
        });

        processed.push(result);

        setProgress(((i + 1) / total) * 100);

        await new Promise((r) => setTimeout(r, 0));
      }

      if (active && !cancelledRef.current) {
        const end = Date.now();
        setEndTime(end);
        setDone(true);

        const duration = (end - startTimeRef.current!) / 1000;

        /*
        await processSessionInChunks({
          sessionId,
          headers,
          rows: processed,
          duration,
        });
        */

        if (false) {
          onComplete();
        }
      }
    }

    run();

    return () => {
      active = false;
      cancelledRef.current = true;
    };
  }, [started]); // 🔥 csak egyszer fut, amikor started true lesz

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
