import React from 'react';
import Info from '../ui/Info';
import Input from '../ui/Input';
import Panel from '../ui/Panel';
import StatusBadge from '../ui/StatusBadge';

export default function IndentDrawer({
  selected,
  selectedItems,
  decision,
  setDecision,
  saving,
  onClose,
  onDecision,
}) {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose}>
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-semibold text-[#178acb]">{selected.indent_no}</p>
            <h2 className="mt-1 text-2xl font-bold">{selected.item_name}</h2>
          </div>
          <button className="rounded border border-slate-300 px-3 py-1 text-lg" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Status" value={<StatusBadge status={selected.status} />} />
            <Info label="Quantity" value={`${selected.quantity} ${selected.uom || ''}`} />
            <Info label="Requested by" value={selected.requested_by_name || selected.requested_by} />
            <Info label="Approver" value={selected.approver_id || '-'} />
            <Info label="Purpose" value={selected.purpose || '-'} />
            <Info label="Remarks" value={selected.remarks || '-'} />
          </div>

          <Panel title="Line Items">
            {selectedItems.length === 0 ? (
              <p className="text-sm text-slate-500">No line items</p>
            ) : (
              selectedItems.map((item) => (
                <div className="flex justify-between border-b border-slate-100 py-2 text-sm" key={item.item_id}>
                  <span className="font-semibold">{item.item_name}</span>
                  <span>{item.quantity} {item.uom || ''}</span>
                </div>
              ))
            )}
          </Panel>

          {selected.status === 'PENDING' && (
            <Panel title="Approval Decision">
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="User ID" type="number" value={decision.approved_by} onChange={(value) => setDecision({ ...decision, approved_by: value })} />
                  <Input label="Name" value={decision.approved_by_name} onChange={(value) => setDecision({ ...decision, approved_by_name: value })} />
                </div>
                <label className="field-label">
                  Remarks
                  <textarea className="scms-input min-h-20 resize-none" value={decision.remarks} onChange={(event) => setDecision({ ...decision, remarks: event.target.value })} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="rounded bg-[#2f9d68] px-4 py-2.5 text-sm font-bold text-white" disabled={saving} type="button" onClick={() => onDecision('approve')}>
                    Approve
                  </button>
                  <button className="rounded bg-[#e63345] px-4 py-2.5 text-sm font-bold text-white" disabled={saving} type="button" onClick={() => onDecision('reject')}>
                    Reject
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </aside>
    </div>
  );
}
