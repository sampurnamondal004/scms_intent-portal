import React from 'react';

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.PENDING}`}>
      {status}
    </span>
  );
}
