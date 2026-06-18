import React from 'react';

export default function StatCard({ value, label, icon, color }) {
  return (
    <div className="flex min-h-[105px] items-center justify-between rounded bg-white px-5 py-4 shadow">
      <div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-xl font-bold">{label}</div>
      </div>
      <div className={`text-6xl font-black leading-none ${color}`}>{icon}</div>
    </div>
  );
}
