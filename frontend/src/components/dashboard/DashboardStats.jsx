import React from 'react';
import StatCard from './StatCard';

export default function DashboardStats({ total }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard value={total || 393} label="Indent" icon="IND" color="text-[#ffb638]" />
      <StatCard value="8442" label="Issue" icon="!" color="text-[#ffb638]" />
      <StatCard value="1579" label="Gate pass" icon="ID" color="text-[#55b6dc]" />
      <StatCard value="3038" label="Item Received" icon="BOX" color="text-[#ffbd42]" />
    </div>
  );
}
