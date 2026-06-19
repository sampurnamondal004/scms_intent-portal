import React, { useMemo, useState } from 'react';
import ConfigModal from './ConfigModal';
import ConfigTable from './ConfigTable';
import ConfigTabs from './ConfigTabs';

const emptyRows = [];
const tableFooter = (count) => `Showing ${count ? 1 : 0} to ${Math.min(count, 10)} of ${count} entries`;

const pageConfig = {
  store: {
    title: 'Store',
    addLabel: 'Add Store',
    columns: ['District', 'Sub-Division', 'Block', 'Store-Code', 'Store Name', 'Store Type'],
    rows: emptyRows,
    actionLabel: 'view',
    footer: tableFooter,
  },
  employee: {
    title: 'Employee',
    addLabel: 'Add Employee',
    columns: ['District', 'Sub-Division', 'Block', 'Store', 'Name', 'Designation', 'User'],
    rows: emptyRows,
    actionLabel: 'Update',
    secondaryActionLabel: 'Change password',
    footer: tableFooter,
  },
  material: {
    title: 'Material',
    addLabel: 'Add Material',
    extraButtons: ['Add Sub-Category', 'Add Category'],
    columns: ['Description', 'Subdescription', 'Material code', 'Material description', 'BIS code', 'HSN code', 'Material unit', 'Double unit'],
    rows: emptyRows,
    actionLabel: 'Edit',
    footer: tableFooter,
  },
  vendor: {
    title: 'Supplier',
    addLabel: 'Add supplier',
    columns: ['Vendor / Supplier name', 'Description', 'Address', 'Contact No', 'Email', 'Licence no', 'Licence valid Till'],
    rows: emptyRows,
    actionLabel: 'Edit',
    footer: tableFooter,
  },
  manufacturer: {
    title: 'Manufacturer',
    addLabel: 'Add manufacturer',
    columns: ['Manufacturer Name', 'Address', 'Website', 'Contact'],
    rows: emptyRows,
    actionLabel: 'Edit',
    footer: tableFooter,
  },
};

export default function StoreConfigSection() {
  const [activeTab, setActiveTab] = useState('store');
  const [modal, setModal] = useState(null);
  const [rowsByTab, setRowsByTab] = useState(() =>
    Object.fromEntries(Object.entries(pageConfig).map(([key, value]) => [key, value.rows])),
  );
  const config = pageConfig[activeTab];
  const rows = rowsByTab[activeTab] || [];

  const actionButtons = useMemo(() => {
    const buttons = [config.addLabel, ...(config.extraButtons || [])];
    return buttons;
  }, [config]);

  function openModal(action, row) {
    setModal({ action, row });
  }

  function saveModal(values) {
    setRowsByTab((current) => {
      const currentRows = current[activeTab] || [];
      if (!modal?.row) {
        return { ...current, [activeTab]: [values, ...currentRows] };
      }
      return {
        ...current,
        [activeTab]: currentRows.map((row) => (row === modal.row ? values : row)),
      };
    });
  }

  return (
    <section className="rounded bg-white/40 p-4">
      <ConfigTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{config.title}</h1>
        <div className="flex flex-wrap justify-end gap-2">
          {actionButtons.map((label, index) => (
            <button
              className={`rounded px-4 py-2 text-sm font-bold text-white ${index === 1 ? 'bg-[#d3a400]' : index === 2 ? 'bg-[#0f8b55]' : 'bg-[#0f8b55]'}`}
              key={label}
              type="button"
              onClick={() => openModal(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ConfigTable
        columns={config.columns}
        rows={rows}
        footer={config.footer}
        actionLabel={config.actionLabel}
        secondaryActionLabel={config.secondaryActionLabel}
        onAction={openModal}
      />
      <ConfigModal
        action={modal?.action}
        title={config.title}
        row={modal?.row}
        fields={config.columns}
        onClose={() => setModal(null)}
        onSave={saveModal}
      />
    </section>
  );
}
