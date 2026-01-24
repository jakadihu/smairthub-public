"use client";

import { useI18n } from "../useI18n";

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

  const { headers, rows, summary } = result;

  const headerLabels = Array.isArray(headers)
    ? headers.map((h: any) =>
        typeof h === "string"
          ? h
          : (h.normalized ?? h.original ?? h.key ?? "?"),
      )
    : [];

  const safeRows = Array.isArray(rows) ? rows : [];


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

      {/* EREDETI TÁBLA MEGJELENÍTÉSE */}
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
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Hiba</th>
                  <th className="border px-2 py-1">Pont</th>

                  {/* Eredeti oszlopok */}
                  {headerLabels.map((h) => (
                    <th key={h} className="border px-2 py-1">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {safeRows.map((row: any, i: number) => {
                  const isWarning = !row.success;
                  const displayIndex =
                    typeof row.index === "number" ? row.index : i;

                  return (
                    <tr key={i} className={isWarning ? "bg-yellow-100" : ""}>
                      <td className="border px-2 py-1">{displayIndex}</td>

                      <td className="border px-2 py-1">
                        {row.success ? "OK" : "HIBA"}
                      </td>

                      <td className="border px-2 py-1">
                        {row.errorMessage || ""}
                      </td>

                      <td className="border px-2 py-1">{row.score ?? ""}</td>

                      {/* Eredeti cellák */}
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
