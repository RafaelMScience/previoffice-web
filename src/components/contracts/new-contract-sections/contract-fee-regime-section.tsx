'use client';

import React from 'react';
import { Percent } from 'lucide-react';
import type { FeeModel } from '@/types/contract';

interface ContractFeeRegimeSectionProps {
  feeModel: FeeModel;
  onFeeModelChange: (model: FeeModel) => void;
  quotaLitisPercentage: number;
  onQuotaLitisChange: (val: number) => void;
  estimatedRetroactive: number;
  onEstimatedRetroactiveChange: (val: number) => void;
  fixedAmount: number;
  onFixedAmountChange: (val: number) => void;
  installmentsCount: number;
  onInstallmentsCountChange: (val: number) => void;
  firstDueDate: string;
  onFirstDueDateChange: (val: string) => void;
  locale: string;
}

export function ContractFeeRegimeSection({
  feeModel,
  onFeeModelChange,
  quotaLitisPercentage,
  onQuotaLitisChange,
  estimatedRetroactive,
  onEstimatedRetroactiveChange,
  fixedAmount,
  onFixedAmountChange,
  installmentsCount,
  onInstallmentsCountChange,
  firstDueDate,
  onFirstDueDateChange,
  locale,
}: ContractFeeRegimeSectionProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#082A52] uppercase mb-2">
          {isEn
            ? '3. Remuneration & Legal Fees Regime'
            : '3. Regime de Remuneração e Honorários Advocatícios'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onFeeModelChange('QUOTA_LITIS')}
            className={`p-3 rounded-lg border text-left transition-all ${
              feeModel === 'QUOTA_LITIS'
                ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 shadow-xs'
                : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="font-bold text-xs text-[#082A52]">
              {isEn ? 'Quota Litis' : 'Quota Litis'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? 'Pure success fee on back payments' : 'Êxito puro sobre atrasados'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onFeeModelChange('FIXED_INSTALLMENT')}
            className={`p-3 rounded-lg border text-left transition-all ${
              feeModel === 'FIXED_INSTALLMENT'
                ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 shadow-xs'
                : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="font-bold text-xs text-[#082A52]">
              {isEn ? 'Installments' : 'Parcelamento'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? 'Monthly installments booklet' : 'Carnê / parcelas mensais'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onFeeModelChange('HYBRID')}
            className={`p-3 rounded-lg border text-left transition-all ${
              feeModel === 'HYBRID'
                ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 shadow-xs'
                : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="font-bold text-xs text-[#082A52]">
              {isEn ? 'Hybrid' : 'Híbrido'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isEn ? 'Down payment + Quota Litis' : 'Entrada + Quota Litis'}
            </div>
          </button>
        </div>
      </div>

      {/* Quota Litis Inputs */}
      {feeModel !== 'FIXED_INSTALLMENT' && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Success Percentage (%)' : 'Percentual de Êxito (%)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={50}
                value={quotaLitisPercentage}
                onChange={(e) => onQuotaLitisChange(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
              <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Estimated Back Payments (R$)' : 'Estimativa de Atrasados (R$)'}
            </label>
            <input
              type="number"
              step="500"
              value={estimatedRetroactive}
              onChange={(e) => onEstimatedRetroactiveChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            />
            <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
              {isEn ? 'Projected fee: R$ ' : 'Êxito previsto: R$ '}
              {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      )}

      {/* Installments Inputs */}
      {feeModel !== 'QUOTA_LITIS' && (
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Fixed Total Amount (R$)' : 'Valor Fixo Total (R$)'}
            </label>
            <input
              type="number"
              step="100"
              value={fixedAmount}
              onChange={(e) => onFixedAmountChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Installment Count' : 'Nº de Parcelas'}
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={installmentsCount}
              onChange={(e) => onInstallmentsCountChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            />
            <div className="text-[10px] text-slate-500 mt-1">
              {installmentsCount}x {isEn ? 'of R$ ' : 'de R$ '}
              {(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              {isEn ? '1st Due Date' : '1º Vencimento'}
            </label>
            <input
              type="date"
              value={firstDueDate}
              onChange={(e) => onFirstDueDateChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
