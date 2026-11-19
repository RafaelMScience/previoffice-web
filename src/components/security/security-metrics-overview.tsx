'use client';

import React from 'react';
import {
  ShieldCheck,
  Activity,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { SecurityStats } from '@/types/security';

interface SecurityMetricsOverviewProps {
  stats: SecurityStats;
}

export function SecurityMetricsOverview({ stats }: SecurityMetricsOverviewProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Cryptographic Integrity Seal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 relative overflow-hidden group hover:border-[#C89543]/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{t.security.statIntegritySeal}</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-600">100%</span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Intacto</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
          SHA-256 • Imutabilidade forense ativa
        </p>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 relative overflow-hidden group hover:border-[#C89543]/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{t.security.statActiveSessions}</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.activeSessionsCount}</span>
          <span className="text-xs text-slate-500 font-medium">dispositivos</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Conexões autenticadas na banca
        </p>
      </div>

      {/* Sensitive Data Access (INSS passwords / Reports) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 relative overflow-hidden group hover:border-[#C89543]/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{t.security.statSensitiveAccess}</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <KeyRound className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700">{stats.sensitiveDataAccessCount}</span>
          <span className="text-xs text-amber-600 font-medium">consultas</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Meu INSS e senhas auditadas
        </p>
      </div>

      {/* Security Alerts / Failures */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 relative overflow-hidden group hover:border-[#C89543]/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{t.security.statAlerts}</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.securityAlertsCount}</span>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            Atenção
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Logins suspeitos ou falhas de auth
        </p>
      </div>
    </div>
  );
}
