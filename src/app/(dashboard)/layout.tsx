'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FileText, Scale, BookOpen, ShieldCheck, Search, Plus, Settings, LogOut } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { OperatorSwitcherModal } from '@/components/ui/operator-switcher-modal';
import { WelcomeModalProvider } from '@/components/welcome-modal/welcome-modal-context';
import { WelcomeHeaderButton } from '@/components/welcome-modal/welcome-header-button';
import { createClient } from '@/lib/supabase/client';
import { dedupeRequest } from '@/lib/cache/request-cache';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCpf } from '@/lib/domain/cpf-validator';
import { useWelcomeModal } from '@/components/welcome-modal/welcome-modal-context';
import { TermsConsentModal } from '@/components/terms/terms-consent-modal';
import { InactivityLockScreen } from '@/components/lock-screen/inactivity-lock-screen';
import { useInactivityTracker } from '@/components/lock-screen/inactivity-tracker';
import { CURRENT_TERMS_VERSION } from '@/components/terms/terms-content';
import { recordAuditLog } from '@/lib/services/audit-service';

const FIRST_ACCESS_EMAIL_KEY = 'previoffice_first_access_email';

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const { currentUser, isAuthenticated, isLoading, canAccess, logout, refreshUser } = useAuth();
  const pathname = usePathname();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [navCounts, setNavCounts] = useState<{ clients: number; attendances: number }>({ clients: 0, attendances: 0 });

  // Welcome tour & LGPD terms sequencing
  const { isWelcomeOpen } = useWelcomeModal();
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Check if current operator has accepted LGPD terms
  useEffect(() => {
    if (!currentUser?.id || isWelcomeOpen) return;

    let hasAccepted = false;
    try {
      const stored = localStorage.getItem(`previoffice_terms_accepted_${currentUser.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.version === CURRENT_TERMS_VERSION) {
          hasAccepted = true;
        }
      }
    } catch {
      // Ignored
    }

    if (!hasAccepted) {
      setShowTermsModal(true);
    }
  }, [currentUser?.id, isWelcomeOpen]);

  // Inactivity tracker (45 min) with zero data loss lock screen
  const { isLocked, unlock } = useInactivityTracker({
    timeoutMs: 45 * 60 * 1000,
    enabled: isAuthenticated && !isLoading,
    onLock: () => {
      if (currentUser?.tenantId) {
        recordAuditLog({
          tenantId: currentUser.tenantId,
          actorId: currentUser.id,
          actorName: currentUser.fullName || 'Operador',
          actorRole: currentUser.memberType || 'Operador',
          action: 'SESSION_LOCKED_INACTIVITY',
          actionDescription: 'Tela bloqueada automaticamente após 45 minutos de inatividade.',
          targetResource: `SESSION:${currentUser.id}`,
          severity: 'INFO',
        }).catch(() => {});
      }
    },
    onUnlock: () => {
      if (currentUser?.tenantId) {
        recordAuditLog({
          tenantId: currentUser.tenantId,
          actorId: currentUser.id,
          actorName: currentUser.fullName || 'Operador',
          actorRole: currentUser.memberType || 'Operador',
          action: 'SESSION_UNLOCKED',
          actionDescription: 'Sessão desbloqueada pelo operador.',
          targetResource: `SESSION:${currentUser.id}`,
          severity: 'INFO',
        }).catch(() => {});
      }
    },
  });

  // Debounced global search state with request cancellation
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const debouncedGlobalSearch = useDebounce(globalSearchTerm, 300);
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; fullName: string; cpf?: string; benefitType?: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Ctrl + K keyboard shortcut to focus global search and click-outside handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cancellable debounced search effect: aborts prior in-flight request when user types
  useEffect(() => {
    if (!debouncedGlobalSearch.trim() || !currentUser?.tenantId) {
      setSearchResults([]);
      setIsSearching(false);
      setIsSearchOpen(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const supabase = createClient();
    const term = debouncedGlobalSearch.trim();
    const cleanTerm = term.replace(/\D/g, '');

    async function executeSearch() {
      try {
        let query = (supabase.from('clients') as any)
          .select('id, full_name, cpf, benefit_type')
          .eq('tenant_id', currentUser!.tenantId)
          .is('deleted_at', null)
          .abortSignal(controller.signal)
          .limit(6);

        // Sanitize search term to prevent PostgREST .or() syntax tree parse errors on commas or parentheses
        const safeTerm = term.replace(/[,()]/g, ' ').trim();

        if (cleanTerm.length >= 3) {
          query = query.or(`full_name.ilike.%${safeTerm}%,normalized_cpf.ilike.%${cleanTerm}%`);
        } else {
          query = query.ilike('full_name', `%${safeTerm}%`);
        }

        const { data, error } = await query;
        if (!controller.signal.aborted && !error && data) {
          setSearchResults(
            data.map((c: any) => ({
              id: c.id,
              fullName: c.full_name,
              cpf: c.cpf,
              benefitType: c.benefit_type,
            }))
          );
          setIsSearchOpen(true);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError' && !controller.signal.aborted) {
          console.error('Error during global search:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }

    executeSearch();

    return () => {
      controller.abort();
    };
  }, [debouncedGlobalSearch, currentUser?.tenantId]);

  // Revalidate user profile on route changes to detect real-time deactivation immediately
  useEffect(() => {
    refreshUser();
  }, [pathname, refreshUser]);

  useEffect(() => {
    let isMounted = true;
    if (!currentUser?.tenantId) return;
    const supabase = createClient();
    async function loadCounts() {
      try {
        const counts = await dedupeRequest(
          `nav-counts:${currentUser!.tenantId}`,
          async () => {
            const [{ count: clientsCount }, { count: attendancesCount }] = await Promise.all([
              (supabase.from('clients') as any)
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', currentUser!.tenantId)
                .is('deleted_at', null),
              (supabase.from('attendances') as any)
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', currentUser!.tenantId),
            ]);
            return {
              clients: clientsCount || 0,
              attendances: attendancesCount || 0,
            };
          },
          { ttlMs: 15000 }
        );

        if (isMounted) {
          setNavCounts(counts);
        }
      } catch (e) {
        console.error('Error fetching nav counts:', e);
      }
    }
    loadCounts();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.tenantId, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Security gate: If not authenticated, operator must change password, or deactivated, expel directly to /login
  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || !currentUser.active) {
        if (currentUser && !currentUser.active) {
          logout().finally(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          });
        } else {
          router.push('/login');
        }
      } else if (currentUser.mustChangePassword) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(FIRST_ACCESS_EMAIL_KEY, currentUser.email);
        }
        router.push('/definir-senha');
      } else if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, currentUser, logout, router]);

  // Block rendering until authenticated
  if (isLoading || !isAuthenticated || !currentUser || !currentUser.active || currentUser.mustChangePassword) {
    return (
      <div className="min-h-screen bg-[#0B192E] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C89543] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium tracking-wide">Validando sessão segura...</span>
      </div>
    );
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
                    {navCounts.clients > 0 && (
                      <span className="ml-auto bg-[#C89543] text-[#0B192E] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {navCounts.clients}
                      </span>
                    )}
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
                    {navCounts.attendances > 0 && (
                      <span className="ml-auto bg-slate-800 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                        {navCounts.attendances}
                      </span>
                    )}
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
                  {currentUser.isAdminLawyer
                    ? 'Sócio Admin'
                    : currentUser.memberType === 'LAWYER'
                    ? currentUser.oabNumber || 'Advogado'
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
          {/* Debounced Cancellable Global Search Input with Autocomplete */}
          <div ref={searchContainerRef} className="relative">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 w-96 focus-within:border-[#C89543] focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                placeholder={t.topbar.searchPlaceholder}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
              />
              {isSearching ? (
                <span className="w-3.5 h-3.5 border-2 border-[#C89543] border-t-transparent rounded-full animate-spin shrink-0" />
              ) : globalSearchTerm ? (
                <button
                  type="button"
                  aria-label="Limpar pesquisa"
                  onClick={() => {
                    setGlobalSearchTerm('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              ) : (
                <span className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-semibold shrink-0">
                  Ctrl + K
                </span>
              )}
            </div>

            {/* Autocomplete Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div
                className="absolute left-0 top-full mt-1.5 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Resultados da busca rápida
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setGlobalSearchTerm('');
                        router.push(`/clientes/${client.id}`);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50/60 transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#C89543] truncate">
                          {client.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {client.cpf ? formatCpf(client.cpf) : 'CPF não informado'}
                        </div>
                      </div>
                      {client.benefitType && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium shrink-0">
                          {client.benefitType}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Welcome Slides Guide */}
            <WelcomeHeaderButton />

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

        {/* LGPD Terms & Responsibility Consent Modal (After tour) */}
        <TermsConsentModal
          isOpen={showTermsModal}
          onAccepted={() => {
            setShowTermsModal(false);
            refreshUser?.();
          }}
        />

        {/* 45-Minute Inactivity Lock Screen (Preserves form data) */}
        <InactivityLockScreen
          isLocked={isLocked}
          onUnlock={unlock}
          onSignOut={handleLogout}
          user={currentUser ? { fullName: currentUser.fullName, role: currentUser.memberType } : null}
        />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WelcomeModalProvider>
      <DashboardContent>{children}</DashboardContent>
    </WelcomeModalProvider>
  );
}
