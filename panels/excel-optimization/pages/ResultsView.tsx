"use client";

import { AlertTriangle, XCircle, CheckCircle, Info } from "lucide-react";
import { useState } from "react";

export default function ResultsView({
  result,
  t,
}: {
  result: any;
  t: (key: string) => string;
}) {
  if (!result) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Nincs eredmény.</p>
      </div>
    );
  }

  const { headers, rows, duration } = result;

  const safeRows = Array.isArray(rows) ? rows : [];

  function renderStatusIcon(status: string) {
    if (status === "danger")
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === "warning")
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  }

  function cellBg(issues: any[]) {
    if (!issues || issues.length === 0) return "";
    if (issues.some((i) => i.severity === "danger")) return "bg-red-50";
    if (issues.some((i) => i.severity === "warning")) return "bg-yellow-50";
    return "";
  }

  return (
    <div className="space-y-6 p-6">
      <p className="text-sm text-muted-foreground">
        Feldolgozási idő: {duration.toFixed(2)} másodperc
      </p>

      {/* HEADER LISTA */}
      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-2">{t("results.headers")}</h2>
        <p className="text-sm text-muted-foreground">
          {headers.join(", ")}
        </p>
      </div>

      {/* EREDMÉNY TÁBLA */}
      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-2">{t("results.rows")}</h2>

        {safeRows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nincs megjeleníthető sor.
          </p>
        )}

        {safeRows.length > 0 && (
          <div className="max-h-[600px] overflow-auto border rounded">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">Státusz</th>
                  <th className="border px-2 py-1">Pont</th>

                  {headers.map((h) => (
                    <th key={h} className="border px-2 py-1">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {safeRows.map((row: any, i: number) => {
                  const displayIndex =
                    typeof row.index === "number" ? row.index : i;

                  return (
                    <tr
                      key={i}
                      className={
                        row.rowStatus === "danger"
                          ? "bg-red-50"
                          : row.rowStatus === "warning"
                          ? "bg-yellow-50"
                          : ""
                      }
                    >
                      <td className="border px-2 py-1">{displayIndex}</td>

                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-1">
                          {renderStatusIcon(row.rowStatus)}
                          {row.rowStatus.toUpperCase()}
                        </div>
                      </td>

                      <td className="border px-2 py-1">
                        {(row.rowScore ?? 0).toFixed(2)}
                      </td>

                      {headers.map((key) => {
                        const cell = row.normalized?.[key];
                        const issues = cell?.issues ?? [];
                        const normalized = cell?.normalized;

                        return (
                          <td
                            key={key}
                            className={`border px-2 py-1 relative ${cellBg(
                              issues
                            )}`}
                          >
                            <div className="flex flex-col">
                              {/* Eredeti érték */}
                              <span className="text-gray-800">
                                {row.original?.[key] ?? ""}
                              </span>

                              {/* Normalizált érték */}
                              {normalized !== null &&
                                normalized !== undefined &&
                                String(normalized) !== String(row.original?.[key]) && (
                                  <span className="text-xs text-blue-600">
                                    → {String(normalized)}
                                  </span>
                                )}
                            </div>

                            {/* Tooltip ikon, ha van issue */}
                            {issues.length > 0 && (
                              <div className="absolute top-1 right-1 group">
                                <Info className="w-3 h-3 text-gray-500" />

                                <div className="hidden group-hover:block absolute right-0 top-4 bg-white border shadow-lg p-2 text-xs z-10 w-48">
                                  {issues.map((iss: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className={
                                        iss.severity === "danger"
                                          ? "text-red-600"
                                          : "text-yellow-600"
                                      }
                                    >
                                      • {iss.message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
