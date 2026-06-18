import React, { useMemo, useState } from 'react';
import {
  employeeRows,
  manufacturerRows,
  materialRows,
  storeRows,
  vendorRows,
} from '../../data/mockData';
import ConfigModal from './ConfigModal';
import ConfigTable from './ConfigTable';
import ConfigTabs from './ConfigTabs';

const pageConfig = {
  store: {
    title: 'Store',
    addLabel: 'Add Store',
    columns: ['District', 'Sub-Division', 'Block', 'Store-Code', 'Store Name', 'Store Type'],
    rows: storeRows,
    actionLabel: 'view',
    footer: (count) => `Showing 1 to ${Math.min(count, 10)} of 70 entries`,
  },
  employee: {
    title: 'Employee',
    addLabel: 'Add Employee',
    columns: ['District', 'Sub-Division', 'Block', 'Store', 'Name', 'Designation', 'User'],
    rows: employeeRows,
    actionLabel: 'Update',
    secondaryActionLabel: 'Change password',
    footer: (count) => `Showing 1 to ${Math.min(count, 10)} of ${count || 1} entries`,
  },
  material: {
    title: 'Material',
    addLabel: 'Add Material',
    extraButtons: ['Add Sub-Category', 'Add Category'],
    columns: ['Description', 'Subdescription', 'Material code', 'Material description', 'BIS code', 'HSN code', 'Material unit', 'Double unit'],
    rows: materialRows,
    actionLabel: 'Edit',
    footer: (count) => `Showing 1 to ${Math.min(count, 10)} of 83 entries`,
  },
  vendor: {
    title: 'Supplier',
    addLabel: 'Add supplier',
    columns: ['Vendor / Supplier name', 'Description', 'Address', 'Contact No', 'Email', 'Licence no', 'Licence valid Till'],
    rows: vendorRows,
    actionLabel: 'Edit',
    footer: (count) => `Showing 1 to ${Math.min(count, 10)} of 17 entries`,
  },
  manufacturer: {
    title: 'Manufacturer',
    addLabel: 'Add manufacturer',
    columns: ['Manufacturer Name', 'Address', 'Website', 'Contact'],
    rows: manufacturerRows,
    actionLabel: 'Edit',
    footer: (count) => `Showing 1 to ${Math.min(count, 10)} of ${count} entries`,
  },
};

export default function StoreConfigSection() {
  const [activeTab, setActiveTab] = useState('store');
  const [modal, setModal] = useState(null);
  const config = pageConfig[activeTab];

  const actionButtons = useMemo(() => {
    const buttons = [config.addLabel, ...(config.extraButtons || [])];
    return buttons;
  }, [config]);

  function openModal(action, row) {
    setModal({ action, row });
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
        rows={config.rows}
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
      />
    </section>
  );
}
