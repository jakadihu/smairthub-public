"use client";

import { useState } from "react";
import { useI18n } from "../useI18n";
import Uploader from "./Uploader";
import { Button } from "@packages/ui/button";
import { ArrowRight } from "lucide-react";
import AnalyzeView from "./AnalyzeView/AnalyzeView";
import ProcessingView from "./ProcessingView";
import ResultsView from "./ResultsView";

export default function ExcelOptimizationRootPage({
  locale,
}: {
  locale: string;
}) {
  const t = useI18n(locale);

  const [step, setStep] = useState<
    "upload" | "analyze" | "processing" | "done"
  >("upload");

  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);

  const [analysis, setAnalysis] = useState<any | null>(null);
  const [config, setConfig] = useState<any | null>(null);
  const [result, setResult] = useState<any | null>(null);

  function handleNext() {
    if (!file) return;
    setStep("analyze");
  }

  return (
    <div className="space-y-6">
      {/* 1) FÁJL FELTÖLTÉS */}
      {step === "upload" && (
        <>
          <h1>{t("title")}</h1>
          <p>{t("upload")}</p>

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
              {t("continue")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* 2) ELEMZÉS (fejlécek, típusok, preview, időbecslés) */}
      {step === "analyze" && file && (
        <AnalyzeView
          file={file}
          onConfigured={(config, analysis) => {
            setConfig(config);
            setAnalysis(analysis);
            setStep("processing");
          }}
        />
      )}

      {/* 3) FELDOLGOZÁS (SSE, progress, cancel) */}
      {step === "processing" && config && analysis && (
        <ProcessingView
          headers={config.headers}
          types={config.types}
          rows={analysis.rows}
          onBack={() => setStep("analyze")}
          onComplete={(result) => {
            setResult(result);
            setStep("done");
          }}
        />
      )}

      {/* 4) EREDMÉNYEK */}
      {step === "done" && result && <ResultsView result={result} t={t} />}
    </div>
  );
}
