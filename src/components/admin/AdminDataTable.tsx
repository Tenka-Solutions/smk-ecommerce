export function AdminDataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | React.ReactNode>>;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--card)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
          <thead className="bg-[var(--color-surface-strong)]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left font-semibold text-[var(--color-muted)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-[var(--color-ink)]">
                    {cell}
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
