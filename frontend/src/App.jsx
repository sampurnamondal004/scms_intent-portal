import React, { useEffect, useState } from 'react';
import {
  approveIndent,
  createIndent,
  getIndentItems,
  listIndents,
  rejectIndent,
} from './api';
import DashboardStats from './components/dashboard/DashboardStats';
import StoreTables from './components/dashboard/StoreTables';
import StoreConfigSection from './components/config/StoreConfigSection';
import IndentDrawer from './components/indent/IndentDrawer';
import IndentForm from './components/indent/IndentForm';
import IndentQueue from './components/indent/IndentQueue';
import AppLayout from './components/layout/AppLayout';
import LoginScreen from './components/LoginScreen';
import { emptyForm, emptyItem } from './data/indentDefaults';
import { pruneIndentPayload } from './utils/indentPayload';

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [indents, setIndents] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', requested_by: '', approver_id: '' });
  const [selected, setSelected] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [decision, setDecision] = useState({
    approved_by: '',
    approved_by_name: '',
    remarks: '',
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (signedIn) {
      loadIndents();
    }
  }, [signedIn]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }

  async function loadIndents(nextFilters = filters) {
    setLoading(true);
    setApiError('');
    try {
      const data = await listIndents({ ...nextFilters, limit: 50 });
      setIndents(data.indents || []);
      setTotal(data.total || 0);
    } catch (error) {
      setIndents([]);
      setTotal(0);
      setApiError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitIndent(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = pruneIndentPayload(form);
      await createIndent(payload);
      await loadIndents();
      setForm({ ...emptyForm, items: [{ ...emptyItem }] });
      showToast('Indent created');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function selectIndent(indent) {
    setSelected(indent);
    setSelectedItems([]);

    try {
      const items = await getIndentItems(indent.indent_id);
      setSelectedItems(items || []);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function applyDecision(type) {
    if (!selected) return;
    if (type === 'reject' && !decision.remarks.trim()) {
      showToast('Rejection remarks are required', 'error');
      return;
    }
    setSaving(true);
    try {
      let updated;
      const payload =
        type === 'approve'
          ? {
              approved_by: Number(decision.approved_by),
              approved_by_name: decision.approved_by_name || null,
              remarks: decision.remarks || null,
            }
          : {
              rejected_by: Number(decision.approved_by),
              rejected_by_name: decision.approved_by_name || null,
              remarks: decision.remarks.trim(),
            };
      updated =
        type === 'approve'
          ? await approveIndent(selected.indent_id, payload)
          : await rejectIndent(selected.indent_id, payload);
      setSelected(updated);
      setIndents((current) => current.map((indent) => (indent.indent_id === updated.indent_id ? updated : indent)));
      showToast(type === 'approve' ? 'Indent approved' : 'Indent rejected');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!signedIn) {
    return <LoginScreen onSignIn={() => setSignedIn(true)} />;
  }

  return (
    <AppLayout onLogout={() => setSignedIn(false)}>
      <div className="space-y-4 p-5">
        <StoreConfigSection />
        <DashboardStats total={total} />
        <StoreTables />
        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <IndentForm form={form} setForm={setForm} saving={saving} onSubmit={submitIndent} />
          <IndentQueue
            filters={filters}
            setFilters={setFilters}
            indents={indents}
            total={total}
            loading={loading}
            onSearch={loadIndents}
            onSelect={selectIndent}
          />
        </div>
      </div>

      <IndentDrawer
        selected={selected}
        selectedItems={selectedItems}
        decision={decision}
        setDecision={setDecision}
        saving={saving}
        onClose={() => setSelected(null)}
        onDecision={applyDecision}
      />

      {apiError && (
        <div className="fixed bottom-4 left-[260px] rounded bg-[#fff8db] px-4 py-2 text-sm font-semibold text-[#7a5600] shadow">
          API error: {apiError}
        </div>
      )}
      {toast && (
        <div className={`fixed bottom-4 right-4 rounded px-4 py-3 text-sm font-bold text-white shadow ${toast.type === 'error' ? 'bg-[#e63345]' : 'bg-[#263238]'}`}>
          {toast.message}
        </div>
      )}
    </AppLayout>
  );
}
