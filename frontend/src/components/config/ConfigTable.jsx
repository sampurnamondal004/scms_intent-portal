import React, { useMemo, useState } from 'react';

export default function ConfigTable({ columns, rows, footer, actionLabel, secondaryActionLabel, onAction }) {
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => row.join(' ').toLowerCase().includes(needle));
  }, [query, rows]);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className="rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold" type="button">Excel</button>
          <button className="rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold" type="button">PDF</button>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          Search:
          <input className="h-9 rounded border border-slate-300 px-3 outline-none focus:border-[#178acb]" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
      </div>

      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-white">
              {columns.map((column) => (
                <th className="border-b border-r border-slate-200 px-3 py-3 font-bold" key={column}>
                  {column}
                </th>
              ))}
              {secondaryActionLabel && <th className="border-b border-r border-slate-200 px-3 py-3 font-bold">{secondaryActionLabel}</th>}
              <th className="border-b border-r border-slate-200 px-3 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr className={rowIndex % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'} key={`${row[0]}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td className="border-r border-slate-200 px-3 py-2 font-medium text-slate-700" key={cellIndex}>
                    {cell}
                  </td>
                ))}
                {secondaryActionLabel && (
                  <td className="border-r border-slate-200 px-3 py-2">
                    <button className="rounded bg-[#0f8b55] px-3 py-1.5 text-xs font-semibold text-white" type="button" onClick={() => onAction(secondaryActionLabel, row)}>
                      {secondaryActionLabel}
                    </button>
                  </td>
                )}
                <td className="border-r border-slate-200 px-3 py-2">
                  <button className="rounded bg-[#0f8b55] px-3 py-1.5 text-xs font-semibold text-white" type="button" onClick={() => onAction(actionLabel, row)}>
                    {actionLabel}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>{footer(filteredRows.length)}</span>
        <span className="space-x-4 text-slate-500">
          Previous <b className="rounded border border-slate-300 px-3 py-2 text-slate-800">1</b> 2 3 4 5 6 7 Next
        </span>
      </div>
    </>
  );
}
