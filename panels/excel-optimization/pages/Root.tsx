"use client";

import { useState } from "react";
import { useI18n } from "../useI18n";
import Uploader from "./Uploader";
import { Button } from "@packages/ui/button";
import { ArrowRight } from "lucide-react";
import ProcessingView from "./ProcessingView";
import ResultsView from "./ResultsView";

export default function ExcelOptimizationRootPage({
  locale,
}: {
  locale: string;
}) {
  const t = useI18n(locale);

  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload");
  const [result, setResult] = useState<any | null>(null);

  function handleNext() {
    if (!file) return;
    setStep("processing");
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
        <ProcessingView
          file={file!}
          locale={locale}
          onDone={(result) => {
            setResult(result);
            setStep("done");
          }}
        />
      )}

      {step === "done" && result && <ResultsView result={result} />}
    </div>
  );
}
