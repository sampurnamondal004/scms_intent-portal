import React from 'react';
import { activeStores, inactiveStores } from '../../data/mockData';
import DataTable from '../ui/DataTable';
import Panel from '../ui/Panel';
import Toolbar from '../ui/Toolbar';

export default function StoreTables() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel title="Active Store Transactions">
        <Toolbar />
        <DataTable
          columns={['Store', 'Indent', 'Issue', 'Gatepass', 'Receive']}
          rows={activeStores.map(([store, indent, issue, gatepass, receive]) => [
            store,
            indent,
            issue,
            gatepass,
            receive,
          ])}
          footer="Showing 1 to 10 of 58 entries"
        />
      </Panel>

      <Panel title="In-Active Store">
        <Toolbar />
        <DataTable
          columns={['Store', 'Details']}
          rows={inactiveStores.map((store) => [
            store,
            <button className="rounded bg-[#e63345] px-3 py-1.5 text-xs font-semibold text-white" type="button">
              Show Officer Details
            </button>,
          ])}
          footer="Showing 1 to 10 of 12 entries"
        />
      </Panel>
    </div>
  );
}
