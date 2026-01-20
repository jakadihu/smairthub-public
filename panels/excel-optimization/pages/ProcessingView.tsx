"use client";

import { useEffect, useState } from "react";

interface ProcessingViewProps {
  file: File | null;
  headers: string[];
  rows: any[][];
  onComplete: (result: any) => void;
}

export default function ProcessingView({
  file,
  headers,
  rows,
  onComplete,
}: ProcessingViewProps) {
  const [steps, setSteps] = useState({
    fileReceived: false,
    fileReceivedTime: null as number | null,

    fileValidated: false,
    fileValidatedTime: null as number | null,

    headersNormalized: false,
    headersNormalizedTime: null as number | null,

    rowsExtracted: false,
    rowsExtractedTime: null as number | null,

    rowsProcessing: 0,
    rowsTotal: 0,
    rowsProcessingStart: null as number | null,
    rowsProcessingEnd: null as number | null,

    done: false,
    doneTime: null as number | null,
  });

  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // --- SSE kapcsolat ---
    const es = new EventSource(`${API}/progress-stream`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.current !== undefined && data.total !== undefined) {
          setSteps((s) => {
            const isFirst = s.rowsProcessingStart === null && data.current === 1;
            const isLast = data.current === data.total;

            return {
              ...s,
              rowsProcessing: Math.max(s.rowsProcessing, data.current),
              rowsTotal: data.total,
              rowsProcessingStart: isFirst ? performance.now() : s.rowsProcessingStart,
              rowsProcessingEnd: isLast ? performance.now() : s.rowsProcessingEnd,
            };
          });
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    es.onerror = () => {
      console.error("SSE connection error");
    };

    // --- A feldolgozás indítása ---
    async function process() {
      try {
        // 1) Fájl fogadva
        setSteps((s) => ({
          ...s,
          fileReceived: true,
          fileReceivedTime: performance.now(),
        }));

        await new Promise((r) => setTimeout(r, 300));

        // 2) Fájl ellenőrzése
        setSteps((s) => ({
          ...s,
          fileValidated: true,
          fileValidatedTime: performance.now(),
        }));

        // 3) Header normalizálás
        const normalizedHeaders = await fetch(`${API}/ai/normalize-headers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ headers }),
        }).then((r) => r.json());

        setSteps((s) => ({
          ...s,
          headersNormalized: true,
          headersNormalizedTime: performance.now(),
        }));

        // 4) Sorok megállapítása
        setSteps((s) => ({
          ...s,
          rowsExtracted: true,
          rowsExtractedTime: performance.now(),
          rowsTotal: rows.length,
        }));

        // 5) Batch feldolgozás
        const batchResponse = await fetch(`${API}/ai/validate-batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: normalizedHeaders,
            rows: rows,
          }),
        }).then((r) => r.json());

        // 6) Kész
        setSteps((s) => ({
          ...s,
          done: true,
          doneTime: performance.now(),
        }));

        //onComplete(batchResponse);
      } catch (err) {
        console.error(err);
        setError("Hiba történt a feldolgozás során.");
      }
    }

    process();

    return () => {
      es.close();
    };
  }, []);

  // idő formázó
  const fmt = (t: number | null, base: number | null) =>
    t && base ? ((t - base) / 1000).toFixed(2) + "s" : null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Feldolgozás folyamatban…</h2>

      {error && (
        <div className="p-3 bg-red-500/20 text-red-700 rounded">{error}</div>
      )}

      <div className="space-y-4">
        <StepItem
          label="Fájl fogadva"
          done={steps.fileReceived}
          time={fmt(steps.fileReceivedTime, steps.fileReceivedTime)}
        />

        <StepItem
          label="Fájl ellenőrzése"
          done={steps.fileValidated}
          time={fmt(steps.fileValidatedTime, steps.fileReceivedTime)}
        />

        <StepItem
          label="Fejlécek normalizálása"
          done={steps.headersNormalized}
          time={fmt(steps.headersNormalizedTime, steps.fileValidatedTime)}
        />

        <StepItem
          label="Sorok megállapítása"
          done={steps.rowsExtracted}
          time={fmt(steps.rowsExtractedTime, steps.headersNormalizedTime)}
        />

        <div>
          <StepItem
            label={`Sorok feldolgozása (${steps.rowsProcessing}/${steps.rowsTotal})`}
            done={steps.done}
            time={
              steps.rowsProcessingEnd && steps.rowsProcessingStart
                ? fmt(steps.rowsProcessingEnd, steps.rowsProcessingStart)
                : null
            }
          />

          {!steps.done && steps.rowsTotal > 0 && (
            <div className="w-full bg-muted h-2 rounded mt-2">
              <div
                className="bg-primary h-2 rounded transition-all"
                style={{
                  width: `${(steps.rowsProcessing / steps.rowsTotal) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepItem({
  label,
  done,
  time,
}: {
  label: string;
  done: boolean;
  time?: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full border transition-all ${
          done
            ? "bg-green-500 border-green-600"
            : "bg-muted border-muted-foreground"
        }`}
      />
      <span className="text-sm">
        {label}
        {done && time && (
          <span className="text-xs text-muted-foreground ml-2">({time})</span>
        )}
      </span>
    </div>
  );
}
