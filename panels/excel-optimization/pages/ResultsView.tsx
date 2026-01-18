"use client";

export default function ResultsView({ result }: { result: any }) {
  const { sheets, rows, analysis } = result;

  const previewRows = rows.slice(0, 10);

  return (
    <div className="space-y-10 py-10">
      <h1 className="text-2xl font-bold">Elemzés eredménye</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Sheet-ek</h2>
          <p>{sheets.join(", ")}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Sorok száma</h2>
          <p>{rows.length}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">AI által javasolt header</h2>
          <pre className="text-sm bg-muted p-2 rounded">
            {JSON.stringify(analysis.header, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Anomáliák</h2>
          <p>{analysis.anomalies.length} találat</p>
        </div>
      </div>

      <div>
        <h2 className="font-medium mb-3">Előnézet (első 10 sor)</h2>

        <div className="overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <tbody>
              {previewRows.map((row: any[], i: number) => (
                <tr key={i} className="border-b">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 border-r">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
