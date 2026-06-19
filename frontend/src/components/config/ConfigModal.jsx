import React, { useEffect, useState } from 'react';

export default function ConfigModal({ action, title, row, fields, onClose, onSave }) {
  const [values, setValues] = useState([]);

  useEffect(() => {
    setValues(fields.map((_, index) => row?.[index] || ''));
  }, [action, fields, row]);

  if (!action) return null;

  const readOnly = action === 'View' || action === 'view';

  function updateValue(index, value) {
    setValues((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function save() {
    onSave?.(values);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 px-4" onClick={onClose}>
      <section className="w-full max-w-2xl rounded border border-slate-300 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-lg font-bold text-slate-700">{action} {title}</h3>
          <button className="rounded border border-slate-300 px-3 py-1 text-sm font-bold" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {fields.map((field, index) => (
            <label className="field-label" key={field}>
              {field}
              <input
                className="scms-input"
                value={values[index] || ''}
                readOnly={readOnly}
                onChange={(event) => updateValue(index, event.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button className="rounded border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-bold" type="button" onClick={onClose}>
            Cancel
          </button>
          {!readOnly && (
            <button className="rounded bg-[#0f8b55] px-4 py-2 text-sm font-bold text-white" type="button" onClick={save}>
              Save
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
