"use client";

import { useEffect, useState } from "react";
import SheetSelectorModal from "./SheetSelectorModal";
import ColumnEditor from "./ColumnEditor";
import PreviewTable from "./PreviewTable";
import { Button } from "@packages/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { detectHeader } from "../../logic/detectHeader";

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

export default function AnalyzeView({ file, onConfigured }: AnalyzeViewProps) {
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

  const steps = [
    "Fájl betöltése…",
    "Sheet kiválasztása…",
    "Adatok normalizálása…",
    "Fejlécek detektálása…",
    "Sorok feldolgozása…",
    "Előkészítés befejezve…",
  ];

  const [currentStep, setCurrentStep] = useState(steps[0]);

  // -------------------------------------------------------
  // 1) INSPECT
  // -------------------------------------------------------
  useEffect(() => {
    async function run() {
      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch(`${API}/file/inspect`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error("Inspect failed");

        const meta = await res.json();
        setAnalysis(meta);

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
        const sample = fullNormalized.slice(0, 10);

        // 4) Fejléc detektálás
        const headerInfo = await detectHeader(sample);

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
      } catch (e) {
        console.error(e);
        setError("Nem sikerült feldolgozni a fájlt.");
      } finally {
        setProcessing(false);
      }
    }

    processFile();
  }, [analysis, selectedSheet, file, API]); // ❗ processing NINCS ITT

  // -------------------------------------------------------
  // PROGRESS UI
  // -------------------------------------------------------
  useEffect(() => {
    if (!processing) {
      setCurrentStep(steps[steps.length - 1]);
      return;
    }

    let i = 0;
    setCurrentStep(steps[0]);

    const interval = setInterval(() => {
      i++;
      if (i < steps.length) {
        setCurrentStep(steps[i]);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [processing, steps]);

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------  

  if (loading || processing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-sm text-muted-foreground">{currentStep}</p>
      </div>
    );
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!analysis) return null;

  function handleContinue() {
    const config = {
      headers,
      types,
      sheet: selectedSheet,
      fileInfo: analysis.fileInfo,
    };

    onConfigured(config, processed);
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
      <h2 className="text-xl font-semibold">Fájl elemzése</h2>

      <div className="rounded-sm border p-4 bg-muted/30 text-sm space-y-1">
        <div>
          <strong>Fájlnév:</strong> {file.name}
        </div>
        <div>
          <strong>Típus:</strong> {analysis.type.toUpperCase()}
        </div>
        <div>
          <strong>Méret:</strong> {formatBytes(file.size)}
        </div>
        {processed?.raw && (
          <div>
            <strong>Sorok száma:</strong> {processed.raw.length}
          </div>
        )}
      </div>

      {analysis.type === "xlsx" && Array.isArray(analysis.sheets) && (
        <SheetSelectorModal
          open={showSheetModal}
          sheets={analysis.sheets}
          selectedSheet={selectedSheet}
          onSelect={setSelectedSheet}
          onClose={() => setShowSheetModal(false)}
        />
      )}

      {headers.length > 0 && (
        <ColumnEditor
          headers={headers}
          types={types}
          onHeaderChange={setHeaders}
          onTypeChange={setTypes}
        />
      )}

      {Array.isArray(processed?.rows) && (
        <PreviewTable headers={headers} rows={processed.rows} />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza
        </Button>

        <Button onClick={handleContinue}>
          Fájl feldolgozása
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
