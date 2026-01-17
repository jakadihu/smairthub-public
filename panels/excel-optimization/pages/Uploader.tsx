"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, FileText, X } from "lucide-react";
import { Button } from "@packages/ui/button";
import { useI18n } from "../useI18n";

export default function Uploader({
  locale,
  onFileChange,
}: {
  locale: string;
  onFileChange: (file: File | null, valid: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const t = useI18n(locale);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setFiles(acceptedFiles);

      if (!file) {
        onFileChange(null, false);
        return;
      }

      const valid =
        file.type.includes("excel") ||
        file.type.includes("spreadsheet") ||
        file.type.includes("csv");

      onFileChange(file, valid);
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
            {t.drop_here}
          </p>
        ) : (
          <>
            <p className="font-medium text-foreground">{t.drag_here}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.click_to_upload}
            </p>

            <Button variant="secondary" className="mt-4 pointer-events-none">
              <Upload className="w-4 h-4 mr-2" />
              {t.select_file}
            </Button>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">
            {t.uploaded_file}
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
