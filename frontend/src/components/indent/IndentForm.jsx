import React from 'react';
import { emptyItem } from '../../data/indentDefaults';
import Input from '../ui/Input';
import Panel from '../ui/Panel';

export default function IndentForm({ form, setForm, saving, onSubmit }) {
  function updateItem(index, key, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function removeItem(index) {
    setForm({
      ...form,
      items: form.items.length === 1 ? [{ ...emptyItem }] : form.items.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  return (
    <Panel title="Create Indent">
      <form className="grid gap-3" onSubmit={onSubmit}>
        <Input label="Item name" required value={form.item_name} onChange={(value) => setForm({ ...form, item_name: value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantity" type="number" required value={form.quantity} onChange={(value) => setForm({ ...form, quantity: value })} />
          <Input label="UOM" value={form.uom} onChange={(value) => setForm({ ...form, uom: value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Requester ID" type="number" required value={form.requested_by} onChange={(value) => setForm({ ...form, requested_by: value })} />
          <Input label="Requester name" value={form.requested_by_name} onChange={(value) => setForm({ ...form, requested_by_name: value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Approver" type="number" value={form.approver_id} onChange={(value) => setForm({ ...form, approver_id: value })} />
          <Input label="Store" type="number" value={form.store_id} onChange={(value) => setForm({ ...form, store_id: value })} />
          <Input label="Dept" type="number" value={form.dept_code} onChange={(value) => setForm({ ...form, dept_code: value })} />
        </div>
        <label className="field-label">
          Purpose
          <textarea className="scms-input min-h-20 resize-none" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
        </label>

        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            Line items
            <button className="text-[#178acb]" type="button" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}>
              Add
            </button>
          </div>
          {form.items.map((item, index) => (
            <div className="mb-2 grid grid-cols-[1fr_76px_42px] gap-2" key={index}>
              <input className="scms-input" placeholder="Item" value={item.item_name} onChange={(event) => updateItem(index, 'item_name', event.target.value)} />
              <input className="scms-input" min="1" type="number" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
              <button className="rounded border border-slate-300 bg-white font-bold text-[#e63345]" type="button" onClick={() => removeItem(index)}>
                x
              </button>
            </div>
          ))}
        </div>

        <button className="rounded bg-[#2f5cc8] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit">
          {saving ? 'Submitting...' : 'Submit Indent'}
        </button>
      </form>
    </Panel>
  );
}
