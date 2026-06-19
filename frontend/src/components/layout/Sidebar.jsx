import React from 'react';

function NavItem({ label, active }) {
  return <div className={`border-b border-white/10 py-2 ${active ? 'font-bold' : 'text-white/75'}`}>[ ] {label}</div>;
}

function NavSub({ label, active }) {
  return <div className={`ml-4 py-1.5 ${active ? 'text-[#1bb2ff]' : 'text-white/65'}`}>o {label}</div>;
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-60 bg-[#152f91] text-white shadow-xl">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="text-3xl font-bold">SCMS</div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-[#10277d] text-xl" type="button">
          =
        </button>
      </div>
      <nav className="space-y-1 px-5 text-sm">
        <NavItem label="Store Transactions" />
        <NavItem label="Planning" />
        <NavItem label="Admin" active />
        <NavSub label="Store Configuration" active />
        <NavSub label="Generate SO" />
        <NavSub label="Rate Configuration" />
        <NavSub label="Approve Employee" />
        <NavSub label="View Stock Status" />
        <NavSub label="View Indent Status" active />
        <NavSub label="SO Revision" />
        <NavItem label="MIS" />
      </nav>
    </aside>
  );
}
