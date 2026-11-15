'use client';

import React from 'react';
import Link from 'next/link';
import { Users, FileText, Scale, BookOpen, ShieldCheck, Search, Plus } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Fixed Sticky Sidebar */}
      <aside className="w-64 bg-[#0B192E] text-white flex flex-col flex-shrink-0 sticky top-0 h-screen z-40 border-r border-white/10">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C89543] to-[#dfad5e] flex items-center justify-center text-[#0B192E] font-extrabold text-xl shadow-md">
            §
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">PreviOffice</h1>
            <span className="text-[11px] font-semibold text-[#C89543] uppercase tracking-wider">Legal Practice SaaS</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 flex flex-col gap-1 flex-grow overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-white/40 px-3 py-2 font-bold">
            Front Desk Operations
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-medium text-sm bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] hover:bg-white/5 transition-all"
          >
            <Users className="w-4 h-4 text-[#C89543]" />
            <span>Visits & Clients</span>
            <span className="ml-auto bg-[#C89543] text-[#0B192E] text-[11px] font-bold px-2 py-0.5 rounded-full">
              4
            </span>
          </Link>

          <Link
            href="/attendances"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Attendances & Returns</span>
          </Link>

          <Link
            href="/contracts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Contracts & OAB POA</span>
          </Link>

          <div className="text-[10px] uppercase tracking-wider text-white/40 px-3 py-3 font-bold">
            Intelligence & Legislation
          </div>
          <Link
            href="/vade-mecum"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Vade Mecum (320k Laws)</span>
          </Link>

          <Link
            href="/security"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Audit (LGPD)</span>
          </Link>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
            REC
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">Reception Desk</div>
            <div className="text-[11px] text-slate-400 truncate">Full Client Access · Multi-user</div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 w-96 focus-within:border-[#C89543] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, mobile or CPF..."
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
            <span className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-semibold">
              Ctrl + K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF8ED] border border-[#C89543]/30 text-[#C89543]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89543]"></span>
              Active Office Session
            </span>
            <Link
              href="/clientes/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#C89543] text-[#0B192E] hover:bg-[#B38234] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Intake / Arrival
            </Link>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
