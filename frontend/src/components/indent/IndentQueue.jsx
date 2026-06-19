import React from 'react';
import DataTable from '../ui/DataTable';
import Panel from '../ui/Panel';
import StatusBadge from '../ui/StatusBadge';

export default function IndentQueue({
  filters,
  setFilters,
  indents,
  total,
  loading,
  onSearch,
  onSelect,
}) {
  return (
    <Panel title="Indent Approval Queue">
      <div className="mb-3 grid gap-2 md:grid-cols-[150px_150px_150px_auto]">
        <select className="scms-input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input className="scms-input" placeholder="Requester" type="number" value={filters.requested_by} onChange={(event) => setFilters({ ...filters, requested_by: event.target.value })} />
        <input className="scms-input" placeholder="Approver" type="number" value={filters.approver_id} onChange={(event) => setFilters({ ...filters, approver_id: event.target.value })} />
        <button className="rounded bg-[#178acb] px-4 py-2 text-sm font-bold text-white" type="button" onClick={() => onSearch(filters)}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>
      <DataTable
        columns={['Indent', 'Item', 'Requester', 'Status', 'Action']}
        rows={indents.map((indent) => ({
          id: indent.indent_id,
          cells: [
            indent.indent_no,
            `${indent.item_name} (${indent.quantity} ${indent.uom || ''})`,
            indent.requested_by_name || indent.requested_by,
            <StatusBadge status={indent.status} />,
            <button className="rounded bg-[#178acb] px-3 py-1.5 text-xs font-semibold text-white" type="button" onClick={() => onSelect(indent)}>
              View
            </button>,
          ],
        }))}
        footer={`Showing ${indents.length ? 1 : 0} to ${indents.length} of ${total} entries`}
      />
    </Panel>
  );
}
