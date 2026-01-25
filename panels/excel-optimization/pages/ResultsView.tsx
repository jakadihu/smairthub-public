"use client";

import { useI18n } from "../useI18n";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

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

  const { headers, rows } = result;

  const headerLabels = Array.isArray(headers)
    ? headers.map((h: any) =>
        typeof h === "string"
          ? h
          : (h.normalized ?? h.original ?? h.key ?? "?")
      )
    : [];

  const safeRows = Array.isArray(rows) ? rows : [];

  function renderStatusIcon(status: string) {
    if (status === "danger")
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === "warning")
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  }

  return (
    <div className="space-y-6 p-6">
      <p className="text-sm text-muted-foreground">
        Feldolgozási idő: {result.duration.toFixed(2)} másodperc
      </p>

      {/* HEADER LISTA */}
      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-2">{t("results.headers")}</h2>
        <p className="text-sm text-muted-foreground">
          {headerLabels.join(", ")}
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
                  <th className="border px-2 py-1">Hibák</th>

                  {headerLabels.map((h) => (
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

                  const issues = Object.values(row.normalized ?? {})
                    .flatMap((cell: any) => cell.issues || []);

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

                      <td className="border px-2 py-1">
                        {issues.length > 0
                          ? issues.map((iss: any, idx: number) => (
                              <div
                                key={idx}
                                className={
                                  iss.severity === "danger"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }
                              >
                                • {iss.type}
                              </div>
                            ))
                          : "—"}
                      </td>

                      {headerLabels.map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {row.original?.[key] ?? ""}
                        </td>
                      ))}
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
