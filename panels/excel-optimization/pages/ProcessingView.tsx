"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@packages/ui/progress";
import { useI18n } from "../useI18n";

import { readFileToRows } from "@/panels/_core/ai/readFiles";
import { analyzeDataWithAI } from "@/panels/_core/ai/analyze";

export default function ProcessingView({
  file,
  locale,
  onDone,
}: {
  file: File;
  locale: string;
  onDone: (result: any) => void;
}) {
  const t = useI18n(locale);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function run() {
      // 1) Fájl beolvasása
      setProgress(10);
      const parsed = await readFileToRows(file);      

      // 2) AI elemzés
      setProgress(40);
      const analysis = await analyzeDataWithAI(parsed.rows);
      console.log("AI analysis:", analysis);

      // 3) Normalizálás (később)
      setProgress(70);

      // 4) Befejezés
      setProgress(100);

      // átadjuk az eredményt a root-nak 
      onDone({ 
        sheets: parsed.sheets,
        rows: parsed.rows,
        analysis,
      });
    }

    run();
  }, [file]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />

      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{t.processing}</p>

        <p className="text-sm text-muted-foreground">
          {progress < 30 && "1. Fájl beolvasása…"}
          {progress >= 30 && progress < 60 && "2. Adatok előkészítése…"}
          {progress >= 60 && progress < 90 && "3. Normalizálás…"}
          {progress >= 90 && "4. Befejezés…"}
        </p>
      </div>

      <Progress value={progress} className="w-64" />
    </div>
  );
}
