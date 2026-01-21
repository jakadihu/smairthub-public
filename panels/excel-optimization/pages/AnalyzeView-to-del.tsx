"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@packages/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@packages/ui/dialog";
import { Button } from "@packages/ui/button";
import { Input } from "@packages/ui/input";
import { Loader2 } from "lucide-react";

interface AnalyzeViewProps {
  file: File;
  onConfigured: (config: any, analysis: any) => void;
}

export default function AnalyzeView({ file, onConfigured }: AnalyzeViewProps) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [showSheetModal, setShowSheetModal] = useState(false);

  const [headers, setHeaders] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // 1) INSPECT – metaadatok lekérése
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

        // XLSX esetén sheet választás
        if (meta.type === "xlsx") {
          if (meta.sheets.length === 1) {
            setSelectedSheet(meta.sheets[0]);
          } else {
            setShowSheetModal(true);
          }
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

  // 2) PROCESS – ha sheet kiválasztva, vagy nem XLSX
  useEffect(() => {
    async function processFile() {
      if (!analysis) return;

      if (analysis.type === "xlsx" && !selectedSheet) return;

      const form = new FormData();
      form.append("file", file);

      if (selectedSheet) form.append("sheet", selectedSheet);
      form.append("format", "json");

      const res = await fetch(`${API}/file/process`, {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      let sheetData = json;

      if (json.type === "xlsx") {
        const sheetName = selectedSheet || Object.keys(json.sheets)[0];
        sheetData = json.sheets[sheetName];
      }

      setHeaders(sheetData.headers || []);
      setTypes(sheetData.headers?.map(() => "string") || []);
      setAnalysis((prev: any) => ({ ...prev, processed: sheetData }));
    }

    processFile();
  }, [selectedSheet, analysis?.type]);

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

  function updateHeader(index: number, value: string) {
    const copy = [...headers];
    copy[index] = value;
    setHeaders(copy);
  }

  function updateType(index: number, value: string) {
    const copy = [...types];
    copy[index] = value;
    setTypes(copy);
  }

  function handleContinue() {
    const config = {
      headers,
      types,
      sheet: selectedSheet,
      fileInfo: analysis.fileInfo,
    };

    onConfigured(config, analysis.processed);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fájl elemzése</h2>

      {/* SHEET SELECTOR MODAL */}
      <Dialog open={showSheetModal} onOpenChange={setShowSheetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Válassz sheetet</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={selectedSheet || ""} onValueChange={setSelectedSheet}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sheet kiválasztása" />
              </SelectTrigger>

              <SelectContent>
                {analysis?.sheets?.map((sheet: string) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              disabled={!selectedSheet}
              onClick={() => setShowSheetModal(false)}
            >
              Folytatás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OSZLOPOK */}
      {headers.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Oszlopok</h3>

          <div className="grid grid-cols-2 gap-4">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={h}
                  onChange={(e) => updateHeader(i, e.target.value)}
                  placeholder="Fejléc"
                />

                <Select
                  value={types[i]}
                  onValueChange={(v) => updateType(i, v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Típus" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="string">Szöveg</SelectItem>
                    <SelectItem value="number">Szám</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="date">Dátum</SelectItem>
                    <SelectItem value="boolean">Logikai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {analysis.processed?.rows && (
        <div>
          <h3 className="font-medium mb-2">Minta sorok</h3>

          <div className="border rounded overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="border px-2 py-1 bg-muted/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysis.processed.rows.slice(0, 10).map((row: any, rIndex: number) => (
                  <tr key={rIndex}>
                    {headers.map((h, cIndex) => (
                      <td key={cIndex} className="border px-2 py-1">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTINUE */}
      <div className="flex justify-end">
        <Button onClick={handleContinue}>Tovább a feldolgozásra</Button>
      </div>
    </div>
  );
}
