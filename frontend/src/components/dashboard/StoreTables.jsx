import React, { useMemo, useState } from 'react';
import DataTable from '../ui/DataTable';
import Panel from '../ui/Panel';
import Toolbar from '../ui/Toolbar';

const activeStores = [];
const inactiveStores = [];

export default function StoreTables() {
  const [activeQuery, setActiveQuery] = useState('');
  const [inactiveQuery, setInactiveQuery] = useState('');

  const activeRows = useMemo(() => {
    const needle = activeQuery.trim().toLowerCase();
    return activeStores.filter(([store]) => !needle || store.toLowerCase().includes(needle));
  }, [activeQuery]);

  const inactiveRows = useMemo(() => {
    const needle = inactiveQuery.trim().toLowerCase();
    return inactiveStores.filter((store) => !needle || store.toLowerCase().includes(needle));
  }, [inactiveQuery]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel title="Active Store Transactions">
        <Toolbar value={activeQuery} onSearch={setActiveQuery} />
        <DataTable
          columns={['Store', 'Indent', 'Issue', 'Gatepass', 'Receive']}
          rows={activeRows.map(([store, indent, issue, gatepass, receive]) => ({
            id: store,
            cells: [store, indent, issue, gatepass, receive],
          }))}
          footer={`Showing ${activeRows.length ? 1 : 0} to ${activeRows.length} of ${activeRows.length} entries`}
        />
      </Panel>

      <Panel title="In-Active Store">
        <Toolbar value={inactiveQuery} onSearch={setInactiveQuery} />
        <DataTable
          columns={['Store', 'Details']}
          rows={inactiveRows.map((store) => ({
            id: store,
            cells: [
              store,
              <button className="rounded bg-[#e63345] px-3 py-1.5 text-xs font-semibold text-white" type="button">
                Show Officer Details
              </button>,
            ],
          }))}
          footer={`Showing ${inactiveRows.length ? 1 : 0} to ${inactiveRows.length} of ${inactiveRows.length} entries`}
        />
      </Panel>
    </div>
  );
}
