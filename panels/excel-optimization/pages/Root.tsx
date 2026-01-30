"use client";

import { useState, useCallback, useMemo } from "react";
import { useI18n } from "../useI18n";
import Uploader from "./Uploader";
import { Button } from "@packages/ui/button";
import { ArrowRight } from "lucide-react";
import AnalyzeView from "./AnalyzeView/AnalyzeView";
import ProcessingView from "./ProcessingView/ProcessingView";
import ResultsView from "./ResultsView/ResultsView";
import { createSession } from "../logic/db/createSession";

export default function ExcelOptimizationRootPage({ locale }: { locale: string }) {
  const t = useI18n(locale);

  const [step, setStep] = useState<"upload" | "analyze" | "processing" | "done">("upload");

  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);

  const [analysis, setAnalysis] = useState<any | null>(null);
  const [config, setConfig] = useState<any | null>(null);  

  const [sessionId, setSessionId] = useState<string | null>(null);

  // 🔥 Stabil callbackek
  const handleNext = useCallback(() => {
    if (!file) return;
    setStep("analyze");
  }, [file]);

  const handleBack = useCallback(() => {
    setStep("analyze");
  }, []);

  const handleComplete = useCallback(() => {
    setStep("done");
  }, []);

  // 🔥 Stabilizált props-ok a ProcessingView-hoz
  const stableHeaders = useMemo(() => config?.headers ?? [], [config]);
  const stableTypes = useMemo(() => config?.types ?? {}, [config]);
  const stableRows = useMemo(() => analysis?.rows ?? [], [analysis]);
  const stableJsonId = useMemo(() => analysis?.jsonId ?? [], [analysis]);  

  console.log("analysis json", analysis?.jsonId);
  console.log("root stabelTypes", stableTypes, step);
  console.log("root stableJsonid", stableJsonId, step);

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

      {/* 2) ELEMZÉS */}
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
            setFile(null);
            setIsValid(false);
            setStep("upload");
          }}
        />
      )}

      {/* 3) FELDOLGOZÁS */}
      {step === "processing" && config && analysis && (
        <ProcessingView
          sessionId={sessionId!}
          headers={stableHeaders}
          types={stableTypes}
          rows={stableRows}
          jsonId = {stableJsonId}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}

      {/* 4) EREDMÉNYEK */}
      {step === "done" && sessionId && <ResultsView sessionId={sessionId} />}
    </div>
  );
}
