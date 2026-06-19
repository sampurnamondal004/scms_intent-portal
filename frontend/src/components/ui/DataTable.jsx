import React from 'react';

export default function DataTable({ columns, rows, footer }) {
  return (
    <div>
      <div className="overflow-x-auto border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-white">
              {columns.map((column) => (
                <th className="border-b border-r border-slate-200 px-3 py-3 font-bold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className={rowIndex % 2 === 0 ? 'bg-[#eeeeee]' : 'bg-white'} key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="border-r border-slate-200 px-3 py-2 font-medium text-slate-700" key={cellIndex}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>{footer}</span>
        <span className="space-x-4 text-slate-500">
          &laquo; &lsaquo; <b className="rounded border border-slate-300 px-3 py-2 text-slate-800">1</b> 2 3 &rsaquo; &raquo;
        </span>
      </div>
    </div>
  );
}
