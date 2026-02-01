"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@packages/ui/button";
import { Progress } from "@packages/ui/progress";
import { ArrowLeft } from "lucide-react";
import { getProgressAction } from "../../logic/ProcessingView/getProgressAction";

export default function ProcessingView({
  sessionId,
  headers,
  types,
  jsonId,
  onBack,
  onComplete,
}: {
  sessionId: string;
  headers: string[];
  types: Record<string, string>;
  jsonId: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const cancelledRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null); 

  // 2) polloljuk a progresset
  useEffect(() => {
    if (error) return;

    const interval = setInterval(async () => {
      if (cancelledRef.current) {
        clearInterval(interval);
        return;
      }
      const state = await getProgressAction(sessionId);

      setProgress(state.progress);

      if (state.status === "error") {
        setError(state.error ?? "Ismeretlen hiba történt.");
        clearInterval(interval);
      }

      if (state.status === "done") {
        setDone(true);
        clearInterval(interval);
        onComplete();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sessionId, error]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza
        </Button>

        {!done && !error && (
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

        {!done && !error && (
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% kész
          </p>
        )}

        {error && <p className="text-red-600 font-medium">{error}</p>}

        {done && (
          <p className="text-green-600 font-medium">Feldolgozás kész!</p>
        )}
      </div>
    </div>
  );
}
