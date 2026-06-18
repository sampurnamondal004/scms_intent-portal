import React from 'react';

export default function Header({ onLogout }) {
  return (
    <header className="sticky top-0 z-10 flex h-[68px] items-center justify-end gap-3 border-b border-slate-200 bg-white px-5 shadow-sm">
      <div className="mr-2 text-right text-xl font-semibold">
        Himanish Saha [ Administrator ] | RD Division Store
      </div>
      <button className="rounded bg-[#e63345] px-3 py-2 text-xs font-bold text-white" type="button" onClick={onLogout}>
        LOGOUT
      </button>
      <button className="header-icon" type="button">H</button>
      <button className="header-icon" type="button">L</button>
    </header>
  );
}
