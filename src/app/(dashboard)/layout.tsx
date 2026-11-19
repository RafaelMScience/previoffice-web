'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FileText, Scale, BookOpen, ShieldCheck, Search, Plus, Settings, LogOut } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { OperatorSwitcherModal } from '@/components/ui/operator-switcher-modal';

const FIRST_ACCESS_EMAIL_KEY = 'previoffice_first_access_email';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const { currentUser, canAccess, logout } = useAuth();
  const pathname = usePathname();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Security gate: If operator attempts to bypass without completing first-access, expel directly to /login
  useEffect(() => {
    if (currentUser?.mustChangePassword) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(FIRST_ACCESS_EMAIL_KEY);
      }
      router.push('/login');
    }
  }, [currentUser, router]);

  // Block rendering while redirecting if operator must change password
  if (currentUser?.mustChangePassword) {
    return null;
  }

  const isClients = pathname === '/' || pathname.startsWith('/clientes');
  const isAttendances = pathname.startsWith('/attendances');
  const isContracts = pathname.startsWith('/contracts');
  const isVadeMecum = pathname.startsWith('/vade-mecum');
  const isSecurity = pathname.startsWith('/security');
  const isSettings = pathname.startsWith('/settings');

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
            <span className="text-[11px] font-semibold text-[#C89543] uppercase tracking-wider">
              {t.navigation.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Navigation Menu (Filtered dynamically by RBAC permissions) */}
        <nav className="p-3 flex flex-col gap-1 flex-grow overflow-y-auto">
          {/* Operations Section */}
          {(canAccess('receptionDesk') || canAccess('contractsAndFinancial')) && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-white/40 px-3 py-2 font-bold">
                {t.navigation.sectionOperations}
              </div>

              {canAccess('receptionDesk') && (
                <>
                  <Link
                    href="/"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isClients
                      ? 'bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] text-white font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <Users className={`w-4 h-4 ${isClients ? 'text-[#C89543]' : 'text-white/60'}`} />
                    <span>{t.navigation.visitsAndClients}</span>
                    <span className="ml-auto bg-[#C89543] text-[#0B192E] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      4
                    </span>
                  </Link>

                  <Link
                    href="/attendances"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isAttendances
                      ? 'bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] text-white font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <FileText className={`w-4 h-4 ${isAttendances ? 'text-[#C89543]' : 'text-white/60'}`} />
                    <span>{t.navigation.attendancesAndReturns}</span>
                    <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                      7
                    </span>
                  </Link>
                </>
              )}

              {canAccess('contractsAndFinancial') && (
                <Link
                  href="/contracts"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isContracts
                    ? 'bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] text-white font-bold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Scale className={`w-4 h-4 ${isContracts ? 'text-[#C89543]' : 'text-white/60'}`} />
                  <span>{t.navigation.contractsAndPoa}</span>
                </Link>
              )}
            </>
          )}

          {/* Intelligence & Knowledge Section */}
          <div className="text-[10px] uppercase tracking-wider text-white/40 px-3 py-3 font-bold">
            {t.navigation.sectionIntelligence}
          </div>
          <Link
            href="/vade-mecum"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isVadeMecum
              ? 'bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] text-white font-bold'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
          >
            <BookOpen className={`w-4 h-4 ${isVadeMecum ? 'text-[#C89543]' : 'text-white/60'}`} />
            <span>{t.navigation.vadeMecum}</span>
          </Link>

          {canAccess('securityAudit') && (
            <Link
              href="/security"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isSecurity
                ? 'bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] text-white font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isSecurity ? 'text-[#C89543]' : 'text-white/60'}`} />
              <span>{t.navigation.securityAudit}</span>
            </Link>
          )}

          {canAccess('adminSettings') && (
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${isSettings
                ? 'bg-gradient-to-r from-[#C89543]/20 to-transparent border-l-2 border-[#C89543] text-white font-bold'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Settings className={`w-4 h-4 ${isSettings ? 'text-[#C89543]' : 'text-white/60'}`} />
              <span>{t.navigation.settings}</span>
            </Link>
          )}
        </nav>

        {/* Language selector in sidebar */}
        <div className="p-3 border-t border-white/10">
          <LanguageSwitcher variant="sidebar" />
        </div>

        {/* User Card with Switcher button */}
        <div className="p-3 border-t border-white/10 bg-black/20 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#082A52] to-[#0B78D0] border border-[#C89543]/40 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {currentUser.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span>
                  {currentUser.memberType === 'LAWYER'
                    ? (currentUser.isAdminLawyer ? 'Sócio Admin' : currentUser.oabNumber || 'Advogado')
                    : currentUser.memberType === 'ASSISTANT'
                      ? 'Recepção'
                      : 'Estagiário'}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(true)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#C89543] hover:text-[#dfad5e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Alternar entre usuários cadastrados para simular as permissões"
            >
              <Users className="w-3 h-3" />
              <span>Alternar (RBAC)</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Encerrar sessão e sair para a tela de login"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Operator Switcher Modal */}
      <OperatorSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 w-96 focus-within:border-[#C89543] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.topbar.searchPlaceholder}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
            <span className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-semibold">
              Ctrl + K
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Topbar Language Switcher */}
            <LanguageSwitcher variant="pill" />

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF8ED] border border-[#C89543]/30 text-[#C89543]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89543]"></span>
              {t.topbar.activeSession}
            </span>

            {canAccess('receptionDesk') && (
              <Link
                href="/clientes/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#C89543] text-[#0B192E] hover:bg-[#B38234] transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                {t.topbar.newIntake}
              </Link>
            )}
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
