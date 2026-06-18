import React from 'react';

export default function Info({ label, value }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="mb-1 text-xs font-bold uppercase text-slate-500">{label}</p>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
