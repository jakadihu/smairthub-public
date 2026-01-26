"use client";

import { useEffect, useState } from "react";
import SheetSelectorModal from "./SheetSelectorModal";
import ColumnEditor from "./ColumnEditor";
import PreviewTable from "./PreviewTable";
import { Button } from "@packages/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  FileTypeCorner,
  Weight,
  ListCheck,
  AlertCircleIcon,
  Sheet,
} from "lucide-react";
import { detectHeader } from "../../logic/detectHeader";
import ProgressStepper from "./ProgressStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/alert";
import { toast } from "sonner";
import { useI18n } from "../../useI18n";

interface AnalyzeViewProps {
  file: File;
  onConfigured: (config: any, analysis: any) => void;
}

type SheetData = {
  raw: any[][];
  rowCount: number;
};

// -------------------------------------------------------
//  NORMALIZÁLÓ FUNKCIÓK
// -------------------------------------------------------

function toStringMatrix(rawMatrix: any[][]): string[][] {
  return rawMatrix.map((row) =>
    row.map((cell) =>
      cell === null || cell === undefined ? "" : String(cell),
    ),
  );
}

function normalizeColumns(matrix: string[][]): string[][] {
  const maxCols = Math.max(...matrix.map((row) => row.length || 0));
  return matrix.map((row) => {
    const newRow = [...row];
    while (newRow.length < maxCols) newRow.push("");
    return newRow;
  });
}

// -------------------------------------------------------
//  KOMPONENS
// -------------------------------------------------------

export default function AnalyzeView({
  file,
  locale,
  onConfigured,
  onCancel,
}: {
  file: File;
  locale: string;
  onConfigured: (config: any, analysis: any) => void;
  onCancel: () => void;
}) {
  const t = useI18n(locale);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [showSheetModal, setShowSheetModal] = useState(false);

  const [headers, setHeaders] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [processed, setProcessed] = useState<any | null>(null);

  const [processing, setProcessing] = useState(false);

  const [pipelineRunning, setPipelineRunning] = useState(true);

  const steps = [
    "analyze_view.analyze_steps.load_file",
    "analyze_view.analyze_steps.select_sheet",
    "analyze_view.analyze_steps.normalize_data",
    "analyze_view.analyze_steps.detect_headers",
    "analyze_view.analyze_steps.procees_rows",
    "analyze_view.analyze_steps.preparation_completed",
  ];

  const [currentStep, setCurrentStep] = useState(steps[0]);

  const hasDuplicateHeaders = (() => {
    const seen = new Set<string>();
    for (const h of headers) {
      if (seen.has(h)) return true;
      seen.add(h);
    }
    return false;
  })();

  function handleHeaderChange(newHeaders: string[]) {
    const oldHeaders = headers;

    // 1) headers frissítése
    setHeaders(newHeaders);

    // 2) rows kulcsainak átnevezése
    if (processed?.rows) {
      const updatedRows = processed.rows.map((row: any) => {
        const newRow: any = {};

        newHeaders.forEach((newName, i) => {
          const oldName = oldHeaders[i];
          newRow[newName] = row[oldName];
        });

        return newRow;
      });

      setProcessed({
        ...processed,
        rows: updatedRows,
      });
    }
  }

  // -------------------------------------------------------
  // 1) INSPECT
  // -------------------------------------------------------
  useEffect(() => {
    async function run() {
      setPipelineRunning(true);
      try {
        setCurrentStep("analyze_view.analyze_steps.load_file");

        const form = new FormData();
        form.append("file", file);

        const res = await fetch(`${API}/file/inspect`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error("Inspect failed");

        const meta = await res.json();
        setAnalysis(meta);

        setCurrentStep("analyze_view.analyze_steps.select_sheet");

        if (meta.type === "xlsx") {
          if (meta.sheets.length === 1) {
            setSelectedSheet(meta.sheets[0]);
          } else {
            setShowSheetModal(true);
          }
        } else {
          setSelectedSheet(null);
        }
      } catch (e) {
        console.error(e);
        setError("Nem sikerült elemezni a fájlt.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [file, API]);

  // -------------------------------------------------------
  // 2) PROCESS — DEADLOCK-MENTES VERZIÓ
  // -------------------------------------------------------
  useEffect(() => {
    async function processFile() {
      if (!analysis) return;
      if (analysis.type === "xlsx" && !selectedSheet) return;

      setProcessing(true);

      try {
        setCurrentStep("analyze_view.analyze_steps.normalize_data");

        const form = new FormData();
        form.append("file", file);
        if (selectedSheet) form.append("sheet", selectedSheet);
        form.append("format", "raw");

        const res = await fetch(`${API}/file/process`, {
          method: "POST",
          body: form,
        });

        const json = await res.json();

        let rawMatrix: any[][] | null = null;

        if (["xlsx", "xls"].includes(json.type)) {
          const sheets = json.sheets as Record<string, SheetData>;

          function normalizeName(name: string) {
            return name.toLowerCase().replace(/\s+/g, "");
          }

          const sheetEntry = Object.entries(sheets).find(([key]) => {
            return normalizeName(key) === normalizeName(selectedSheet || "");
          });

          const finalSheet = sheetEntry?.[1] ?? Object.values(sheets)[0];
          rawMatrix = finalSheet?.raw ?? null;
        } else {
          rawMatrix = json.raw ?? null;
        }

        if (!rawMatrix || !Array.isArray(rawMatrix)) {
          setError("A fájl nem olvasható.");
          return;
        }

        if (rawMatrix.length === 0) {
          setError("A fájl üres.");
          return;
        }

        // 1) Stringesítés
        const stringMatrix = toStringMatrix(rawMatrix);

        // 2) Oszlopszám-normalizálás
        const fullNormalized = normalizeColumns(stringMatrix);

        // 3) Sample a fejlécdetektáláshoz
        setCurrentStep("analyze_view.analyze_steps.detect_headers");
        const sample = fullNormalized.slice(0, 10);

        // 4) Fejléc detektálás
        const headerInfo = await detectHeader(sample, locale);

        const startIndex =
          headerInfo.dataStartIndex !== undefined
            ? headerInfo.dataStartIndex
            : headerInfo.hasHeader
              ? 1
              : 0;

        const dataRows = fullNormalized.slice(startIndex);

        const headerList = headerInfo.headers ?? [];
        const typeList = headerInfo.types ?? [];

        setHeaders(headerList);
        setTypes(typeList);

        // 5) Sorok objektummá alakítása
        setCurrentStep("analyze_view.analyze_steps.procees_rows");
        const headerLength = headerList.length;

        const normalizedRows = dataRows.map((row) => {
          const newRow = [...row];
          while (newRow.length < headerLength) newRow.push("");
          return newRow;
        });

        const objectRows = normalizedRows.map((rowArr) => {
          const obj: any = {};
          headerList.forEach((h, i) => {
            obj[h] = rowArr[i] ?? "";
          });
          return obj;
        });

        setProcessed({
          raw: fullNormalized,
          headers: headerList,
          rows: objectRows,
        });

        setCurrentStep("analyze_view.analyze_steps.preparation_completed");
      } catch (e) {
        console.error(e);
        setError("Nem sikerült feldolgozni a fájlt.");
      } finally {
        setTimeout(() => {
          setProcessing(false);
          setPipelineRunning(false);
        }, 700);
      }
    }

    processFile();
  }, [analysis, selectedSheet, file, API]);

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  const currentIndex = steps.indexOf(currentStep);

  const shouldShowStepper = loading || processing || pipelineRunning;
  
  if (shouldShowStepper) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <ProgressStepper
            steps={steps.map((key) => ({ key, label: t(key) }))}
            currentIndex={currentIndex}
          />
        </div>

        {analysis?.type === "xlsx" && Array.isArray(analysis.sheets) && (
          <SheetSelectorModal
            open={showSheetModal}
            sheets={analysis.sheets}
            selectedSheet={selectedSheet}
            locale={locale}
            onSelect={setSelectedSheet}
            onClose={() => setShowSheetModal(false)}
            onCancel={onCancel}
          />
        )}
      </>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!analysis) return null;

  function handleContinue() {

    
    if(hasDuplicateHeaders) {      
      toast.error(t("analyze_view.duplicate_headers_error.title"), {description: t("analyze_view.duplicate_headers_error.description"), position: "top-center"});        
      return;
    }

    const config = {
      headers,
      types,
      sheet: selectedSheet,
      fileInfo: analysis.fileInfo,
    };

    // A types tömb → objektummá alakítása
    const typeMap = Object.fromEntries(
      config.headers.map((h, i) => [h, config.types[i]]),
    );

    // Továbbadás már helyes formátumban
    onConfigured(
      {
        ...config,
        types: typeMap,
      },
      processed,
    );
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (    
    <div className="space-y-6">
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("analyze_view.file_info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet /> {file.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("analyze_view.file_name")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileTypeCorner /> {analysis.type.toUpperCase()}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("analyze_view.file_type")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sheet /> {selectedSheet || "N/A"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("analyze_view.file_sheet")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Weight /> {formatBytes(file.size)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("analyze_view.file_size")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListCheck /> {processed?.raw.length}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("analyze_view.rows")}</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {headers.length > 0 && (
        <ColumnEditor
          headers={headers}
          types={types}
          locale={locale}
          onHeaderChange={handleHeaderChange}
          onTypeChange={setTypes}
        />
      )}

      {Array.isArray(processed?.rows) && (
        <PreviewTable headers={headers} types={types} rows={processed.rows} locale={locale} />
      )}      

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("analyze_view.back_to_uploader")}
        </Button>

        <Button onClick={handleContinue}>
          {t("analyze_view.process_data")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
