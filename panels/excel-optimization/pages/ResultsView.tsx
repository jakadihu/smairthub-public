"use client";

import { useI18n } from "../useI18n";

export default function ResultsView({ result, t }: { result: any, t: (key: string) => string; }) {  
  //const t = useI18n(locale);

  if (!result) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Nincs eredmény.</p>
      </div>
    );
  }

  const { headers, rows, summary } = result;

  // A headers lehet string[] vagy objektum[]
  const headerLabels = Array.isArray(headers)
    ? headers.map((h: any) =>
        typeof h === "string"
          ? h
          : h.normalized ?? h.original ?? h.key ?? "?"
      )
    : [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">{t("results.title")}</h1>

      {/* Fejlécek */}
      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-2">{t("results.headers")}</h2>
        <p className="text-sm text-muted-foreground">
          {headerLabels.join(", ")}
        </p>
      </div>

      {/* Sorok eredményei */}
      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-2">{t("results.rows")}</h2>

        <div className="space-y-3">
          {rows?.map((row: any, i: number) => (
            <div
              key={i}
              className="p-3 rounded bg-muted/50 border flex flex-col gap-1"
            >
              <div className="text-sm font-medium">
                {t("results.row")} #{row.index + 1}
              </div>

              {row.success ? (
                <div className="text-green-600 text-sm">
                  {t("results.valid")}
                </div>
              ) : (
                <div className="text-red-600 text-sm">
                  {t("results.invalid")}: {row.errorMessage}
                </div>
              )}

              {/* Eredeti sor */}
              <div className="text-xs text-muted-foreground">
                {t("results.original")}: {row.original.join(", ")}
              </div>

              {/* Normalizált adatok */}
              {row.normalized && (
                <div className="text-xs text-muted-foreground">
                  {t("results.normalized")}:{" "}
                  {JSON.stringify(row.normalized)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Összegzés */}
      {summary && (
        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">{t("results.summary")}</h2>
          <pre className="text-xs bg-muted p-3 rounded">
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
