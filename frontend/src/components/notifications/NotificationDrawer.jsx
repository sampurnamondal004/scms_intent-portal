import React, { useState } from 'react';

export default function NotificationDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center gap-1.5 rounded border border-[#1976d2] px-3 py-1.5 text-xs font-semibold text-[#1976d2] hover:bg-[#1976d2] hover:text-white transition-colors"
        title="Notifications"
      >
        <span>&</span>
        <span>Notifications</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-30 h-full w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-[#1976d2] text-white shrink-0">
          <span className="font-semibold text-sm">Notification Service</span>
          <button
            onClick={() => setOpen(false)}
            className="text-white hover:opacity-75 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Notification frontend embedded via iframe */}
        <iframe
          src="http://localhost:5175"
          title="Notification Service"
          className="flex-1 w-full border-none"
          allow="same-origin"
        />
      </div>
    </>
  );
}