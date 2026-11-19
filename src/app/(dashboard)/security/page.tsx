'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Activity,
  FileCheck2,
  Users,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { securityStore } from '@/lib/data/mock-security';
import { SecurityMetricsOverview } from '@/components/security/security-metrics-overview';
import { AuditLogsTable } from '@/components/security/audit-logs-table';
import { ActiveSessionsTab } from '@/components/security/active-sessions-tab';
import { LgpdComplianceTab } from '@/components/security/lgpd-compliance-tab';
import { useAuth } from '@/lib/auth/auth-context';
import { AccessDeniedBoundary } from '@/components/ui/access-denied-boundary';

export default function SecurityPage() {
  const { t } = useI18n();
  const { currentUser, canAccess } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'SESSIONS' | 'LGPD'>('LOGS');
  const [logs, setLogs] = useState(() => securityStore.getAuditLogs());
  const [sessions, setSessions] = useState(() => securityStore.getActiveSessions());
  const [lgpdRecords] = useState(() => securityStore.getLgpdConsents());
  const [stats, setStats] = useState(() => securityStore.getStats());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!canAccess('securityAudit')) {
    return (
      <AccessDeniedBoundary
        moduleName="Auditoria & Segurança Forense (LGPD)"
        requiredPermissionLabel="Auditoria & Segurança Forense (securityAudit)"
      />
    );
  }

  const handleTerminateSession = (sessionId: string) => {
    if (!currentUser) return;
    const success = securityStore.terminateSession(sessionId);
    if (success) {
      setSessions(securityStore.getActiveSessions());
      setStats(securityStore.getStats());
      // Log event
      securityStore.logEvent({
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.isAdminLawyer ? 'Advogado Sócio Titular' : 'Operador Autorizado',
        action: 'UPDATE_PERMISSIONS',
        actionDescription: `Encerrou remotamente a sessão de segurança ID: ${sessionId}`,
        targetResource: `Sessão Remota: ${sessionId}`,
        ipAddress: '189.124.45.102',
        userAgent: 'Chrome 122.0.0 (Windows 11)',
        severity: 'WARNING',
      });
      setLogs(securityStore.getAuditLogs());
      setToastMessage('Sessão remota revogada com sucesso e registrada na trilha de auditoria.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleSimulateSensitiveAccess = () => {
    if (!currentUser) return;
    securityStore.logEvent({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.isAdminLawyer ? 'Advogado Sócio Titular' : 'Operador Autorizado',
      action: 'VIEW_INSS_PASSWORD',
      actionDescription: 'Consultou credencial de acesso Meu INSS do segurado para protocolo de aposentadoria',
      targetResource: 'Cliente: Maria das Dores (CPF: 345.***.***-12)',
      clientId: 'cli-001',
      ipAddress: '189.124.45.102',
      userAgent: 'Chrome 122.0.0 (Windows 11)',
      severity: 'WARNING',
    });
    setLogs(securityStore.getAuditLogs());
    setStats(securityStore.getStats());
    setToastMessage('Acesso a dado sensível registrado com selo criptográfico SHA-256.');
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
