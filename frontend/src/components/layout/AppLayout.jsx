import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayout({ children, onLogout }) {
  return (
    <main className="min-h-screen bg-[#f1f1f1] text-[#263238]">
      <Sidebar />
      <section className="pl-60">
        <Header onLogout={onLogout} />
        {children}
      </section>
    </main>
  );
}
