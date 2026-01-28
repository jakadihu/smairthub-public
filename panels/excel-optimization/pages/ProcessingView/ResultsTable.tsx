"use client";

import { AlertTriangle, XCircle, CheckCircle, Info } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@packages/ui/pagination";

export function ResultsTable({
  rows,
  headers,
  page,
  totalPages,
  onPageChange,
}: {
  rows: any[];
  headers: string[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
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
    <div>
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
            {rows.map((row: any, i: number) => {
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
                        className={`border px-2 py-1 relative ${cellBg(issues)}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-800">
                            {row.original?.[key] ?? ""}
                          </span>

                          {normalized !== null &&
                            normalized !== undefined &&
                            String(normalized) !==
                              String(row.original?.[key]) && (
                              <span className="text-xs text-blue-600">
                                → {String(normalized)}
                              </span>
                            )}
                        </div>

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

      {/* LAPOZÓ */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onPageChange(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          <PaginationItem>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && onPageChange(page + 1)}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
