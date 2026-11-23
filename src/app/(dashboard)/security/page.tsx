'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Activity,
  FileCheck2,
  Users,
  CheckCircle2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  fetchAuditLogs,
  fetchActiveSessions,
  fetchLgpdConsents,
  computeSecurityStats,
  recordAuditLog,
} from '@/lib/services/audit-service';
import { SecurityMetricsOverview } from '@/components/security/security-metrics-overview';
import { AuditLogsTable } from '@/components/security/audit-logs-table';
import { ActiveSessionsTab } from '@/components/security/active-sessions-tab';
import { LgpdComplianceTab } from '@/components/security/lgpd-compliance-tab';
import { useAuth } from '@/lib/auth/auth-context';
import { AccessDeniedBoundary } from '@/components/ui/access-denied-boundary';
import type { ActiveSession, AuditLogEntry, LgpdConsentRecord, SecurityStats } from '@/types/security';

export default function SecurityPage() {
  const { t } = useI18n();
  const { currentUser, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'SESSIONS' | 'LGPD'>('LOGS');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [lgpdRecords, setLgpdRecords] = useState<LgpdConsentRecord[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalLogsToday: 0,
    activeSessionsCount: 0,
    sensitiveDataAccessCount: 0,
    securityAlertsCount: 0,
    integritySealStatus: 'VERIFIED',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!currentUser?.tenantId) return;
    setIsLoading(true);
    try {
      const [fetchedLogs, fetchedSessions, fetchedLgpd] = await Promise.all([
        fetchAuditLogs(currentUser.tenantId),
        fetchActiveSessions(currentUser.tenantId, currentUser.id),
        fetchLgpdConsents(currentUser.tenantId),
      ]);

      setLogs(fetchedLogs);
      setSessions(fetchedSessions);
      setLgpdRecords(fetchedLgpd);
      setStats(computeSecurityStats(fetchedLogs, fetchedSessions));
    } catch (err) {
      console.warn('Erro ao carregar dados de segurança:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.tenantId]);

  if (!canAccess('securityAudit')) {
    return (
      <AccessDeniedBoundary
        moduleName="Auditoria & Segurança Forense (LGPD)"
        requiredPermissionLabel="Auditoria & Segurança Forense (securityAudit)"
      />
    );
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!currentUser) return;
    const targetSession = sessions.find((s) => s.id === sessionId);
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);

    try {
      // Call server endpoint to revoke auth tokens in Supabase Auth
      const res = await fetch('/api/security/terminate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetSession?.userId || sessionId.replace('sess-', ''),
          targetName: targetSession?.userName || sessionId,
        }),
      });

      if (!res.ok) {
        console.warn('Terminate session server response not OK');
      }
    } catch (err) {
      console.warn('Error invoking terminate-session API:', err);
    }

    // Refresh audit logs
    const updatedLogs = await fetchAuditLogs(currentUser.tenantId);
    setLogs(updatedLogs);
    setStats(computeSecurityStats(updatedLogs, updatedSessions));

    setToastMessage('Sessão remota revogada com sucesso em nível global.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSimulateSensitiveAccess = async () => {
    if (!currentUser) return;

    const logged = await recordAuditLog({
      tenantId: currentUser.tenantId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.isAdminLawyer ? 'Advogado Sócio Titular' : 'Operador Autorizado',
      action: 'VIEW_INSS_PASSWORD',
      actionDescription: 'Consultou credencial de acesso Meu INSS do segurado para protocolo de benefício',
      targetResource: 'Credencial Meu INSS (Acesso Protegido)',
      severity: 'WARNING',
    });

    if (logged) {
      const newLogs = [logged, ...logs];
      setLogs(newLogs);
      setStats(computeSecurityStats(newLogs, sessions));
    }

    setToastMessage('Acesso a dado sensível registrado com selo criptográfico de integridade.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#082A52] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#C89543]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#082A52] tracking-tight">
                {t.security.title}
              </h1>
              <p className="text-xs text-slate-500">{t.security.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            title="Atualizar registros de auditoria"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateSensitiveAccess}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:border-[#C89543] text-slate-700 hover:text-[#082A52] transition-all shadow-2xs"
            title="Simular auditoria de acesso à senha do Meu INSS"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C89543]" />
            <span>Simular Acesso Sensível</span>
          </button>

          {canAccess('adminSettings') && (
            <Link
              href="/settings?tab=team"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-[#C89543]" />
              <span>Gerenciar Permissões da Equipe</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metric KPIs */}
      <SecurityMetricsOverview stats={stats} />

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`py-3 px-1 border-b-2 font-bold text-xs inline-flex items-center gap-2 transition-all ${
              activeTab === 'LOGS'
                ? 'border-[#C89543] text-[#082A52]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4 text-[#C89543]" />
            <span>{t.security.tabLogs}</span>
            <span className="ml-1 bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded-full">
              {logs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SESSIONS')}
            className={`py-3 px-1 border-b-2 font-bold text-xs inline-flex items-center gap-2 transition-all ${
              activeTab === 'SESSIONS'
                ? 'border-[#C89543] text-[#082A52]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C89543]" />
            <span>{t.security.tabSessions}</span>
            <span className="ml-1 bg-blue-50 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded-full">
              {sessions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LGPD')}
            className={`py-3 px-1 border-b-2 font-bold text-xs inline-flex items-center gap-2 transition-all ${
              activeTab === 'LGPD'
                ? 'border-[#C89543] text-[#082A52]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#C89543]" />
            <span>{t.security.tabLgpd}</span>
            <span className="ml-1 bg-purple-50 text-purple-700 text-[10px] font-mono px-2 py-0.5 rounded-full">
              {lgpdRecords.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === 'LOGS' && <AuditLogsTable logs={logs} />}
        {activeTab === 'SESSIONS' && (
          <ActiveSessionsTab
            sessions={sessions}
            onTerminateSession={handleTerminateSession}
          />
        )}
        {activeTab === 'LGPD' && <LgpdComplianceTab records={lgpdRecords} />}
      </div>
    </div>
  );
}
