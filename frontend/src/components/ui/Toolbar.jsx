import React from 'react';

export default function Toolbar({ searchLabel = 'Search:', value = '', onSearch }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2">
        {['Copy', 'CSV', 'Excel', 'PDF', 'Print'].map((label) => (
          <button className="rounded border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold" key={label} type="button">
            {label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        {searchLabel}
        <input
          className="h-9 rounded border border-slate-300 px-3 outline-none focus:border-[#178acb]"
          value={value}
          onChange={(event) => onSearch?.(event.target.value)}
        />
      </label>
    </div>
  );
}
