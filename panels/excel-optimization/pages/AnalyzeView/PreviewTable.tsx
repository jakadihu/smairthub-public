"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@packages/ui/dialog";
import { Textarea } from "@packages/ui/textarea";

interface Props {
  headers: string[];
  rows: any[];
}

export default function PreviewTable({ headers, rows }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  function openCellPreview(value: string) {
    setSelectedCell(value);
    setOpen(true);
  }

  return (
    <div>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Előnézet</CardTitle>
          <CardDescription>Az első 10 sor megjelenítése</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Scroll container */}
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full border-collapse text-xs table-auto">
              <thead className="bg-muted/40">
                <tr className="border-b">
                  {/* Row number column */}
                  <th className="w-10 px-2 py-1 text-center text-muted-foreground">
                    #
                  </th>

                  {/* Headers with truncate + max-width */}
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-2 py-1 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis text-left font-medium text-muted-foreground"
                      title={h.length > 20 ? h : undefined}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.slice(0, 10).map((row, rIndex) => (
                  <tr
                    key={rIndex}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* Row number */}
                    <td className="w-10 px-2 py-1 text-center text-muted-foreground">
                      {rIndex + 1}
                    </td>

                    {/* Data cells */}
                    {headers.map((h, cIndex) => {
                      const value = String(row[h] ?? "");

                      return (
                        <td
                          key={cIndex}
                          className="px-2 py-1 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer"
                          onClick={() => openCellPreview(value)}
                          title={value.length > 20 ? value : undefined}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cella előnézet modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cellatartalom</DialogTitle>
          </DialogHeader>

          <Textarea
            value={selectedCell ?? ""}
            readOnly
            className="h-40 resize-none text-sm"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
