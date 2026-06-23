import React from 'react';

const NOTIFICATION_SERVER_URL = 'http://localhost:8001';

export default function Header({ onLogout }) {
  return (
    <header className="sticky top-0 z-10 flex h-[68px] items-center justify-end gap-3 border-b border-slate-200 bg-white px-5 shadow-sm">
      {/* Notification Server Link */}
      <a
        href={NOTIFICATION_SERVER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded border border-[#1976d2] px-3 py-1.5 text-xs font-semibold text-[#1976d2] hover:bg-[#1976d2] hover:text-white transition-colors"
        title="Open Notification Server"
      >
        <span>Notifications</span>
      </a>

      <div className="mr-2 text-right text-xl font-semibold">
        Signed in
      </div>
      <button
        className="rounded bg-[#e63345] px-3 py-2 text-xs font-bold text-white"
        type="button"
        onClick={onLogout}
      >
        LOGOUT
      </button>
      <button className="header-icon" type="button">H</button>
      <button className="header-icon" type="button">L</button>
    </header>
  );
}
