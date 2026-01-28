"use client";

import { useEffect, useState } from "react";
import { getSession } from "../services/getSession";
import { ResultsTable } from "./ProcessingView/ResultsTable";
import { getSessionRowsPaged } from "../services/getSessionRowsPaged";

export default function ResultsView({ sessionId }: { sessionId: string }) {
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [duration, setDuration] = useState<number | null>(null);

  const safeRows = Array.isArray(rows) ? rows : [];

  useEffect(() => {
    async function load() {
      const { rows, totalPages } = await getSessionRowsPaged(
        sessionId,
        page,
        pageSize,
      );

      // header kinyerés
      const headerSet = new Set<string>();
      for (const r of rows) {
        Object.keys(r.normalized ?? {}).forEach((h) => headerSet.add(h));
      }

      setHeaders([...headerSet]);
      setRows(rows);
      setTotalPages(totalPages);

      // session duration lekérése (ha kell)
      const session = await getSession(sessionId);
      setDuration(Number(session.duration));
    }
    load();
  }, [sessionId, page]);

  return (
    <div className="space-y-6 p-6">
      <p className="text-sm text-muted-foreground">
        Feldolgozási idő: {duration?.toFixed(2)} másodperc
      </p>

      {/* EREDMÉNY TÁBLA */}

      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-2">Eredmény</h2>

        {safeRows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nincs megjeleníthető sor.
          </p>
        )}

        {safeRows.length > 0 && (
          <div>
            <ResultsTable
              rows={safeRows}
              headers={headers}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
