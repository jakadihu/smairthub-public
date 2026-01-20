"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, FileText, X } from "lucide-react";
import { Button } from "@packages/ui/button";
import { useI18n } from "../useI18n";
import * as XLSX from "xlsx";

export default function Uploader({
  locale,
  onFileChange,
}: {
  locale: string;
  onFileChange: (
    file: File | null,
    valid: boolean,
    headers?: string[],
    rows?: any[][]
  ) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const t = useI18n(locale);

  // Excel → CSV konverzió
  const convertToCsvIfNeeded = async (file: File): Promise<File> => {
    const isExcel =
      file.name.endsWith(".xls") || file.name.endsWith(".xlsx");

    if (!isExcel) return file;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet, {
      FS: ",",
      RS: "\n",
      blankrows: false,
    });

    return new File([csv], "converted.csv", { type: "text/csv" });
  };

  // CSV feldolgozás → headers + rows
  const parseCsv = (csvText: string) => {
    const lines = csvText.split("\n").filter(Boolean);

    const headers = lines[0].split(",").map(h => h.trim());
    const rows = lines.slice(1).map(line =>
      line.split(",").map(cell => cell.trim())
    );

    return { headers, rows };
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setFiles(acceptedFiles);

      if (!file) {
        onFileChange(null, false);
        return;
      }

      const isValid =
        file.type.includes("excel") ||
        file.type.includes("spreadsheet") ||
        file.type.includes("csv") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv");

      if (!isValid) {
        onFileChange(null, false);
        return;
      }

      // XLS/XLSX → CSV konverzió
      const csvFile = await convertToCsvIfNeeded(file);

      // CSV beolvasása
      const text = await csvFile.text();
      const { headers, rows } = parseCsv(text);

      // Visszaadjuk a feldolgozott adatokat
      onFileChange(csvFile, true, headers, rows);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border border-dashed rounded-xl p-10 cursor-pointer transition
          flex flex-col items-center justify-center text-center
          bg-muted/50 hover:bg-muted
          ${isDragActive ? "animate-pulse bg-accent/40" : ""}
        `}
      >
        <input {...getInputProps()} />

        <Upload
          className={`
            w-12 h-12 mb-4 transition
            ${isDragActive ? "text-accent-foreground" : "text-muted-foreground"}
          `}
        />

        {isDragActive ? (
          <p className="font-medium text-accent-foreground">
            {t("drop_here")}
          </p>
        ) : (
          <>
            <p className="font-medium text-foreground">{t("drag_here")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("click_to_upload")}
            </p>

            <Button variant="secondary" className="mt-4 pointer-events-none">
              <Upload className="w-4 h-4 mr-2" />
              {t("select_file")}
            </Button>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">
            {t("uploaded_file")}
          </p>

          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-muted"
            >
              <div className="flex items-center gap-3">
                {file.name.endsWith(".csv") ? (
                  <FileText className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                )}

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFiles([]);
                  onFileChange(null, false);
                }}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
