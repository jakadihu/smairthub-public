"use client";

import { AlertTriangle, XCircle, Info, Copy } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@packages/ui/pagination";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@packages/ui/hover-card";

import { Tooltip, TooltipTrigger, TooltipContent } from "@packages/ui/tooltip";

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
  function getRowStatus(row: any) {
    if (row.hasError) return "danger";
    if (row.hasWarning) return "warning";
    if (row.hasInfo) return "info";
    if (row.hasDuplicate) return "duplicate";
    return "ok";
  }

  function renderStatusIcon(status: string) {
    if (status === "danger")
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === "warning")
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    if (status === "info") return <Info className="w-4 h-4 text-blue-600" />;
    if (status === "duplicate")
      return <Copy className="w-4 h-4 text-purple-600" />;
    return null;
  }

  function cellBg(issues: any[]) {
    if (!issues || issues.length === 0) return "";
    if (issues.some((i) => i.severity === "error")) return "bg-red-100";
    if (issues.some((i) => i.severity === "warning")) return "bg-yellow-100";
    if (issues.some((i) => i.severity === "info")) return "bg-blue-100";
    return "";
  }

  function rowBg(status: string) {
    if (status === "danger") return "bg-red-50";
    if (status === "warning") return "bg-yellow-50";
    if (status === "info") return "bg-blue-50";
    if (status === "duplicate") return "bg-purple-50";
    return "";
  }

  return (
    <div>
      <div className="max-h-[600px] overflow-auto border rounded-md">
        <table className="w-full border-collapse text-xs table-auto">
          <thead className="bg-muted/40">
            <tr>
              <th className="w-10 px-2 py-1 text-center text-muted-foreground">
                #
              </th>

              <th className="w-8 px-2 py-1 text-center text-muted-foreground">
                {/* státusz ikon helye */}
              </th>

              {headers.map((h) => (
                <th
                  key={h}
                  className="px-2 py-1 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis text-left font-medium text-muted-foreground"
                  title={h.length > 20 ? h : undefined}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row: any, i: number) => {
              const status = getRowStatus(row);
              const displayIndex = row.rowIndex + 1;

              // Sor összes hibája (HoverCard tartalom)
              const rowIssues = [
                ...Object.entries(row.normalized ?? {}).flatMap(
                  ([header, cell]: any) =>
                    cell?.issues?.map((iss: any) => ({
                      header,
                      ...iss,
                    })) ?? [],
                ),
                ...(row.hasDuplicate
                  ? [
                      {
                        header: "SOR",
                        severity: "duplicate",
                        message: "Ez a sor duplikált egy korábbi bejegyzéssel.",
                      },
                    ]
                  : []),
              ];

              return (
                <tr
                  key={i}
                  className={`${rowBg(status)} border-b last:border-0 hover:bg-muted/20 transition-colors`}
                >
                  {/* Sorszám */}
                  <td className="w-10 px-2 py-1 text-center text-muted-foreground">
                    {displayIndex}
                  </td>

                  {/* Státusz ikon + HoverCard */}
                  <td className="w-8 px-2 py-1 text-center">
                    {status !== "ok" && (
                      <HoverCard openDelay={0} closeDelay={0}>
                        <HoverCardTrigger asChild>
                          <div className="cursor-pointer inline-flex items-center justify-center">
                            {renderStatusIcon(status)}
                          </div>
                        </HoverCardTrigger>

                        <HoverCardContent className="w-64 text-xs">
                          <div className="font-medium mb-1">Sor problémái:</div>

                          {rowIssues.length === 0 && (
                            <div className="text-muted-foreground">
                              Nincsenek hibák
                            </div>
                          )}

                          {rowIssues.map((iss, idx) => (
                            <div
                              key={idx}
                              className={
                                iss.severity === "error"
                                  ? "text-red-600"
                                  : iss.severity === "warning"
                                    ? "text-yellow-600"
                                    : iss.severity === "info"
                                      ? "text-blue-600"
                                      : iss.severity === "duplicate"
                                        ? "text-purple-600"
                                        : ""
                              }
                            >
                              • <strong>{iss.header}:</strong> {iss.message}
                            </div>
                          ))}
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </td>

                  {/* Cellák */}
                  {headers.map((key) => {
                    const cell = row.normalized?.[key];
                    const issues = cell?.issues ?? [];
                    const normalized = cell?.normalized;

                    return (
                      <td
                        key={key}
                        className={`px-2 py-1 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis relative ${cellBg(
                          issues,
                        )}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-800">
                            {row.original?.[key] ?? ""}
                          </span>

                          {normalized !== null &&
                            normalized !== undefined &&
                            String(normalized) !==
                              String(row.original?.[key]) && (
                              <span className="text-[10px] text-blue-600">
                                → {String(normalized)}
                              </span>
                            )}
                        </div>

                        {/* Cellaszintű tooltip */}
                        {issues.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="absolute top-1 right-1 w-3 h-3 text-gray-500 cursor-pointer" />
                            </TooltipTrigger>

                            <TooltipContent className="text-xs max-w-[200px]">
                              {issues.map((iss: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={
                                    iss.severity === "error"
                                      ? "text-red-600"
                                      : iss.severity === "warning"
                                        ? "text-yellow-600"
                                        : "text-blue-600"
                                  }
                                >
                                  • {iss.message}
                                </div>
                              ))}
                            </TooltipContent>
                          </Tooltip>
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
