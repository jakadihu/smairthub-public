"use client";

import { useState } from "react";
import { useI18n } from "../useI18n";
import Uploader from "./Uploader";
import { Button } from "@packages/ui/button";
import { ArrowRight } from "lucide-react";
import AnalyzeView from "./AnalyzeView/AnalyzeView";
import ProcessingView from "./ProcessingView/ProcessingView";
import ResultsView from "./ResultsView";
import { createSession } from "../services/createSession";


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

  const [sessionId, setSessionId] = useState<string | null>(null);

  function handleNext() {
    if (!file) return;
    setStep("analyze");
  }

  return (
    <div className="space-y-6">
      {/* 1) FÁJL FELTÖLTÉS */}
      {step === "upload" && (
        <>
          <h1>{t("uploader.title")}</h1>
          <p>{t("uploader.description")}</p>

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
              {t("uploader.continue")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* 2) ELEMZÉS (fejlécek, típusok, preview, időbecslés) */}
      {step === "analyze" && file && (
        <AnalyzeView
          file={file}
          locale={locale}
          onConfigured={async (config, analysis) => {
            const { sessionId } = await createSession();
            setSessionId(sessionId);          
            setConfig(config);
            setAnalysis(analysis);            
            setStep("processing");
          }}
          onCancel={() => {
            setFile(null); // fájl törlése
            setIsValid(false); // valid flag reset
            setStep("upload"); // vissza a feltöltéshez
          }}
        />
      )}

      {/* 3) FELDOLGOZÁS (SSE, progress, cancel) */}
      {step === "processing" && config && analysis && (
        <ProcessingView
          sessionId={sessionId!}
          headers={config.headers}
          types={config.types}
          rows={analysis.rows}
          onBack={() => setStep("analyze")}
          onComplete={() => {
            setStep("done");
          }}
        />
      )}

      {/* 4) EREDMÉNYEK */}
      {step === "done" && <ResultsView result={result} t={t} />}
    </div>
  );
}
