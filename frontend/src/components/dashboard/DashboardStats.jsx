import React from 'react';
import StatCard from './StatCard';

export default function DashboardStats({ total }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard value={total} label="Indent" icon="IND" color="text-[#ffb638]" />
    </div>
  );
}
