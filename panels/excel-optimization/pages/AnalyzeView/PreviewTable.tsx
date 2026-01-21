interface Props {
  headers: string[];
  rows: any[];
}

export default function PreviewTable({ headers, rows }: Props) {
  return (
    <div>
      <h3 className="font-medium mb-2">Minta sorok</h3>

      <div className="border rounded overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border px-2 py-1 bg-muted/40">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.slice(0, 10).map((row, rIndex) => (
              <tr key={rIndex}>
                {headers.map((h, cIndex) => (
                  <td key={cIndex} className="border px-2 py-1">
                    {String(row[h] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
