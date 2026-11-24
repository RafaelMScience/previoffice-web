'use client';

import React from 'react';
import {
  FolderLock,
  CheckCircle2,
  Printer,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import type { Client } from '@/types/client';
import type { ContractTemplate, FeeModel } from '@/types/contract';
import type { Translations } from '@/lib/i18n/types';
import { maskCpf } from '@/lib/utils/masks';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import { ContractRegimeSelector } from './contract-regime-selector';

export interface LawyerOption {
  name: string;
  oab: string;
}

export interface ContractParametersSidebarProps {
  t: Translations;
  client: Client;
  cabinetLocation: string;
  lawyerOptions: LawyerOption[];
  selectedLawyer: LawyerOption;
  setSelectedLawyer: (l: LawyerOption) => void;
  allTemplates: ContractTemplate[];
  selectedFeeTemplateId: string;
  setSelectedFeeTemplateId: (id: string) => void;
  feeModel: FeeModel;
  setFeeModel: (model: FeeModel) => void;
  quotaLitisPercentage: number;
  setQuotaLitisPercentage: (pct: number) => void;
  estimatedRetroactive: number;
  fixedAmount: number;
  setFixedAmount: (amt: number) => void;
  installmentsCount: number;
  setInstallmentsCount: (cnt: number) => void;
  firstDueDate: string;
  setFirstDueDate: (date: string) => void;
  recurringDueDay: number;
  setRecurringDueDay: (day: number) => void;
  formattedFirstDueDate: string;
  selectedKitCount: number;
  isSaving: boolean;
  onFormalize: () => void;
  onPrintBatch: () => void;
}

export function ContractParametersSidebar({
  t,
  client,
  cabinetLocation,
  lawyerOptions,
  selectedLawyer,
  setSelectedLawyer,
  allTemplates,
  selectedFeeTemplateId,
  setSelectedFeeTemplateId,
  feeModel,
  setFeeModel,
  quotaLitisPercentage,
  setQuotaLitisPercentage,
  estimatedRetroactive,
  fixedAmount,
  setFixedAmount,
  installmentsCount,
  setInstallmentsCount,
  firstDueDate,
  setFirstDueDate,
  recurringDueDay,
  setRecurringDueDay,
  formattedFirstDueDate,
  selectedKitCount,
  isSaving,
  onFormalize,
  onPrintBatch,
}: ContractParametersSidebarProps) {
  const cd = t.clientDetails;

  return (
    <aside className="w-full md:w-80 lg:w-88 shrink-0 bg-[#0B192E] border-r border-white/10 flex flex-col h-full overflow-hidden text-white transition-all duration-200">
      {/* Header do Cliente */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 shrink-0">
        <span className="text-[10px] font-bold text-[#C89543] uppercase tracking-wider block mb-1">
          {cd.clientInService}
        </span>
        <h2 className="text-sm font-bold text-white leading-tight">{client.fullName}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          CPF: {client.cpf ? maskCpf(client.cpf) : 'Não informado'} • {formatBenefitType(client.benefitType, 'pt-BR') || 'Previdenciário'}
        </p>
        <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <FolderLock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{cabinetLocation}</span>
        </div>
      </div>

      {/* Configuração de Minutas e Honorários */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Advogado Titular */}
        <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-white/10">
          <label className="block text-[10px] font-bold uppercase text-[#C89543] flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{cd.titularLawyer}</span>
          </label>
          <select
            value={selectedLawyer.name}
            onChange={(e) => {
              const l = lawyerOptions.find((opt) => opt.name === e.target.value) || lawyerOptions[0];
              setSelectedLawyer(l);
            }}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
          >
            {lawyerOptions.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name} ({l.oab})
              </option>
            ))}
          </select>
        </div>

        {/* Escolha da Minuta Contratual Base */}
        <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-white/10">
          <label className="block text-[10px] font-bold uppercase text-[#C89543] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{cd.baseContractTemplate}</span>
          </label>
          <select
            value={selectedFeeTemplateId}
            onChange={(e) => setSelectedFeeTemplateId(e.target.value)}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
          >
            {allTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.isDefault ? '★ [Padrão] ' : ''}
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Regime de Remuneração Modular */}
        <ContractRegimeSelector
          t={t}
          feeModel={feeModel}
          setFeeModel={setFeeModel}
          quotaLitisPercentage={quotaLitisPercentage}
          setQuotaLitisPercentage={setQuotaLitisPercentage}
          estimatedRetroactive={estimatedRetroactive}
          fixedAmount={fixedAmount}
          setFixedAmount={setFixedAmount}
          installmentsCount={installmentsCount}
          setInstallmentsCount={setInstallmentsCount}
          firstDueDate={firstDueDate}
          setFirstDueDate={setFirstDueDate}
          recurringDueDay={recurringDueDay}
          setRecurringDueDay={setRecurringDueDay}
          formattedFirstDueDate={formattedFirstDueDate}
        />

        {/* Resumo do Kit Marcado */}
        <div className="bg-emerald-950/40 border border-emerald-600/30 p-3 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
            <span>{cd.emissionKitSummaryTitle}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
              {cd.emissionKitSummaryBadge.replace('{count}', String(selectedKitCount))}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {cd.emissionKitSummaryDesc}
          </p>
        </div>
      </div>

      {/* Rodapé da Coluna 1 */}
      <div className="p-3 bg-slate-900 border-t border-white/10 shrink-0 space-y-2">
        <button
          type="button"
          onClick={onFormalize}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#168447] hover:bg-[#126b39] text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSaving ? cd.btnFormalizingKit : cd.btnFormalizeKit.replace('{count}', String(selectedKitCount))}</span>
        </button>
        <button
          type="button"
          onClick={onPrintBatch}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#082A52] hover:bg-[#0c396d] text-white text-xs font-bold border border-[#C89543]/40 cursor-pointer transition-all"
        >
          <Printer className="w-4 h-4 text-[#C89543]" />
          <span>{cd.btnPrintSelectedDocs}</span>
        </button>
      </div>
    </aside>
  );
}
