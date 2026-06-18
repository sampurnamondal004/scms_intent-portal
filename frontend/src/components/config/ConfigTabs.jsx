import React from 'react';

const tabs = [
  { id: 'store', label: 'Store' },
  { id: 'employee', label: 'Employee' },
  { id: 'material', label: 'Material' },
  { id: 'vendor', label: 'Vendor Info' },
  { id: 'manufacturer', label: 'Manufacturer' },
];

export default function ConfigTabs({ activeTab, onChange }) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          className={`rounded-t border border-b-0 px-4 py-2 text-sm font-semibold ${
            activeTab === tab.id
              ? 'border-slate-300 bg-white text-slate-800'
              : 'border-transparent bg-transparent text-[#178acb] hover:bg-white/70'
          }`}
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
