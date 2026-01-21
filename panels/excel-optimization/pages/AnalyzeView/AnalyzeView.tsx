"use client";

import { useEffect, useState } from "react";
import SheetSelectorModal from "./SheetSelectorModal";
import ColumnEditor from "./ColumnEditor";
import PreviewTable from "./PreviewTable";
import { Button } from "@packages/ui/button";
import { Loader2 } from "lucide-react";
import { detectHeader } from "../../logic/detectHeader";

interface AnalyzeViewProps {
  file: File;
  onConfigured: (config: any, analysis: any) => void;
}

type SheetData = {
  raw: any[][];
  rowCount: number;
};

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
          // CSV esetén nincs sheet
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
  }, [file]);

  // -------------------------------------------------------
  // 2) PROCESS (CSV és XLSX külön kezelve)
  // -------------------------------------------------------
  useEffect(() => {
    async function processFile() {
      if (!analysis) return;

      // XLSX esetén sheet kell
      if (analysis.type === "xlsx" && !selectedSheet) return;

      // Strict Mode duplafuttatás ellen
      if (processing) return;
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

        let rawMatrix = null;
        if (json.type === "xlsx") {
          const sheets = json.sheets as Record<string, SheetData>;

          const sheetEntry = Object.entries(sheets).find(
            ([key]) => key.trim() === selectedSheet?.trim(),
          );

          rawMatrix = sheetEntry?.[1]?.raw ?? null;
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

        // 1) Mintavétel
        const sample = rawMatrix.slice(0, 10);

        // 2) Normalizálás AI-hoz
        const normalized = sample.map((row) =>
          row.map((cell: any) =>
            cell === null || cell === undefined ? "" : String(cell),
          ),
        );

        const headerInfo = await detectHeader(normalized);

        // 3) Teljes normalizálás
        const fullNormalized = rawMatrix.map((row) =>
          row.map((cell: any) =>
            cell === null || cell === undefined ? "" : String(cell),
          ),
        );

        const startIndex =
          headerInfo.dataStartIndex !== undefined
            ? headerInfo.dataStartIndex
            : headerInfo.hasHeader
              ? 1
              : 0;

        const rows = fullNormalized.slice(startIndex);

        setHeaders(headerInfo.headers ?? []);
        setTypes(headerInfo.types ?? []);

        // Átalakítás objektumokká
        const objectRows = rows.map((rowArr) => {
          const obj: any = {};
          (headerInfo.headers ?? []).forEach((h, i) => {
            obj[h] = rowArr[i] ?? "";
          });
          return obj;
        });

        setProcessed({
          raw: fullNormalized,
          headers: headerInfo.headers,
          rows: objectRows,
        });
      } finally {
        setProcessing(false);
      }
    }

    processFile();
  }, [analysis, selectedSheet]);

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Fájl elemzése…
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fájl elemzése</h2>

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

      <div className="flex justify-end">
        <Button onClick={handleContinue}>Tovább a feldolgozásra</Button>
      </div>
    </div>
  );
}
