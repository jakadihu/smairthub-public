"use client";

import { useState } from "react";
import { useI18n } from "../useI18n";
import Uploader from "./Uploader";
import { Button } from "@packages/ui/button";
import { ArrowRight } from "lucide-react";
import ProcessingView from "./ProcessingView";
import { readFileToRows } from "@/panels/_core/ai/readFiles";
import { analyzeDataWithAI } from "@/panels/_core/ai/analyze";

export default function ExcelOptimizationRootPage({
  locale,
}: {
  locale: string;
}) {
  const t = useI18n(locale);

  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload");

  async function handleNext() {
    if (!file) return;

    setStep("processing");
    setProgress(0);

    // 1) fájl → rows
    const parsed = await readFileToRows(file);
    setProgress(30);

    // 2) AI elemzés (most még mock)
    const analysis = await analyzeDataWithAI(parsed.rows);
    setProgress(70);

    // 3) egyelőre csak eltároljuk – normalizálás később
    console.log("AI analysis:", analysis);

    setProgress(100);
    setStep("done");
  }

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <>
          <h1>{t.title}</h1>
          <p>{t.upload}</p>

          <Uploader
            locale={locale}
            onFileChange={(f, valid) => {
              setFile(f);
              setIsValid(valid);
            }}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!file || !isValid}
              className="flex items-center gap-2"
            >
              {t.continue}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {step === "processing" && (
        <ProcessingView progress={progress} locale={locale} />
      )}

      {step === "done" && (
        <div className="py-20 text-center text-xl font-medium">
          Itt jön majd a következő képernyő (sheet választó / preview)
        </div>
      )}
    </div>
  );
}
