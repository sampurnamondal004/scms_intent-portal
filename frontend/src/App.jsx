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
import { demoIndents, emptyForm, emptyItem } from './data/mockData';
import { pruneIndentPayload } from './utils/indentPayload';

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [indents, setIndents] = useState(demoIndents);
  const [total, setTotal] = useState(demoIndents.length);
  const [filters, setFilters] = useState({ status: '', requested_by: '', approver_id: '' });
  const [selected, setSelected] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [decision, setDecision] = useState({
    approved_by: '1001',
    approved_by_name: 'Himanish Saha',
    remarks: '',
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    loadIndents();
  }, []);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }

  async function loadIndents(nextFilters = filters) {
    setLoading(true);
    try {
      const data = await listIndents({ ...nextFilters, limit: 50 });
      setIndents(data.indents || []);
      setTotal(data.total || 0);
      setBackendOnline(true);
    } catch {
      const filteredDemo = demoIndents.filter((indent) => {
        const statusOk = !nextFilters.status || indent.status === nextFilters.status;
        const requesterOk = !nextFilters.requested_by || String(indent.requested_by) === String(nextFilters.requested_by);
        const approverOk = !nextFilters.approver_id || String(indent.approver_id) === String(nextFilters.approver_id);
        return statusOk && requesterOk && approverOk;
      });
      setIndents(filteredDemo);
      setTotal(filteredDemo.length);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }

  async function submitIndent(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = pruneIndentPayload(form);
      if (backendOnline) {
        await createIndent(payload);
        await loadIndents();
      } else {
        const draft = {
          ...payload,
          indent_id: Date.now(),
          indent_no: `IND-DEMO-${Date.now().toString().slice(-5)}`,
          status: 'PENDING',
          remarks: null,
          approved_by: null,
          approved_by_name: null,
          approved_on: null,
          created_on: new Date().toISOString(),
          updated_on: new Date().toISOString(),
        };
        setIndents((current) => [draft, ...current]);
        setTotal((current) => current + 1);
      }
      setForm({ ...emptyForm, items: [{ ...emptyItem }] });
      showToast(backendOnline ? 'Indent created' : 'Demo indent added');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function selectIndent(indent) {
    setSelected(indent);
    setSelectedItems([]);
    if (!backendOnline) {
      setSelectedItems([{ item_id: 1, item_name: indent.item_name, quantity: indent.quantity, uom: indent.uom }]);
      return;
    }

    try {
      const items = await getIndentItems(indent.indent_id);
      setSelectedItems(items || []);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function applyDecision(type) {
    if (!selected) return;
    setSaving(true);
    try {
      let updated;
      if (backendOnline) {
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
                remarks: decision.remarks || 'Rejected',
              };
        updated =
          type === 'approve'
            ? await approveIndent(selected.indent_id, payload)
            : await rejectIndent(selected.indent_id, payload);
      } else {
        updated = {
          ...selected,
          status: type === 'approve' ? 'APPROVED' : 'REJECTED',
          remarks: decision.remarks || (type === 'approve' ? 'Approved' : 'Rejected'),
          approved_by: Number(decision.approved_by),
          approved_by_name: decision.approved_by_name,
          approved_on: new Date().toISOString(),
        };
      }
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

      {!backendOnline && (
        <div className="fixed bottom-4 left-[260px] rounded bg-[#fff8db] px-4 py-2 text-sm font-semibold text-[#7a5600] shadow">
          Backend not reachable, showing demo data.
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
