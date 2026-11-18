'use client';

import React from 'react';
import { Scale, TrendingUp, CalendarClock, FileCheck2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { ContractKpis } from '@/types/contract';

interface ContractsKpiCardsProps {
  kpis: ContractKpis;
}

export function ContractsKpiCards({ kpis }: ContractsKpiCardsProps) {
  const { t } = useI18n();

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Contracted Legal Fees */}
      <div className="bg-gradient-to-br from-[#082A52] to-[#0B192E] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C89543]/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#C89543] uppercase tracking-wider">
              {t.contracts.kpiTotalContracted}
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#C89543]">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-white">
            {formatBrl(kpis.totalContractedAmount)}
          </div>
        </div>
        <p className="text-[11px] text-slate-300 mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C89543]" />
          {kpis.totalContractsCount} contratos cadastrados no escritório
        </p>
      </div>

      {/* KPI 2: Future Receivables (Quota Litis Success Fees) */}
      <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#0B78D0] uppercase tracking-wider">
              {t.contracts.kpiFutureReceivables}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF6FD] flex items-center justify-center text-[#0B78D0]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[#082A52]">
            {formatBrl(kpis.estimatedSuccessReceivables)}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B78D0]" />
          {t.contracts.kpiFutureReceivablesSub}
        </p>
      </div>

      {/* KPI 3: Open Installments */}
      <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              {t.contracts.kpiOpenInstallments}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[#082A52]">
            {formatBrl(kpis.openInstallmentsAmount)}
          </div>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {kpis.openInstallmentsCount} parcelas a liquidar
          </span>
          {kpis.overdueInstallmentsCount > 0 && (
            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
              {kpis.overdueInstallmentsCount} vencida
            </span>
          )}
        </div>
      </div>

      {/* KPI 4: Physical Contracts Attached & Archived */}
      <div className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#168447] uppercase tracking-wider">
              {t.contracts.kpiPhysicalSignedRate}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#168447]">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[#082A52]">
            {kpis.signedPhysicalAttachedRate.toFixed(1)}%
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#168447]" />
          {kpis.signedPhysicalCount} de {kpis.totalContractsCount} pastas com scan físico
        </p>
      </div>
    </div>
  );
}
