import React from 'react';

export default function Panel({ title, children }) {
  return (
    <section className="overflow-hidden rounded border border-slate-300 bg-white shadow">
      <div className="border-b border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-[#178acb]">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
