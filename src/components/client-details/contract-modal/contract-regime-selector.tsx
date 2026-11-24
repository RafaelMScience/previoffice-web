'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import type { FeeModel } from '@/types/contract';
import type { Translations } from '@/lib/i18n/types';

export interface ContractRegimeSelectorProps {
  t: Translations;
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
}

export function ContractRegimeSelector({
  t,
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
}: ContractRegimeSelectorProps) {
  const cd = t.clientDetails;

  return (
    <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-white/10">
      <span className="text-[10px] font-bold uppercase text-slate-300 block">
        {cd.remunerationRegime}
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => setFeeModel('QUOTA_LITIS')}
          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
            feeModel === 'QUOTA_LITIS'
              ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <div className="text-xs font-semibold">{cd.regimeQuotaLitis}</div>
          <div className="text-[9px] opacity-75">{cd.regimeQuotaLitisDesc}</div>
        </button>
        <button
          type="button"
          onClick={() => setFeeModel('FIXED_INSTALLMENT')}
          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
            feeModel === 'FIXED_INSTALLMENT'
              ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <div className="text-xs font-semibold">{cd.regimeInstallment}</div>
          <div className="text-[9px] opacity-75">{cd.regimeInstallmentDesc}</div>
        </button>
        <button
          type="button"
          onClick={() => setFeeModel('HYBRID')}
          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
            feeModel === 'HYBRID'
              ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <div className="text-xs font-semibold">{cd.regimeHybrid}</div>
          <div className="text-[9px] opacity-75">{cd.regimeHybridDesc}</div>
        </button>
      </div>

      {/* Detalhes Quota Litis */}
      {feeModel === 'QUOTA_LITIS' && (
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">{cd.successPercentage}</span>
            <span className="font-bold text-[#C89543] text-sm">{quotaLitisPercentage}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={quotaLitisPercentage}
            onChange={(e) => setQuotaLitisPercentage(Number(e.target.value))}
            className="w-full accent-[#C89543] cursor-pointer"
          />
          <div className="text-[11px] text-slate-400 bg-slate-800/80 p-2 rounded">
            {cd.estimatedRetroactive} R$ {estimatedRetroactive.toLocaleString('pt-BR')},00 <br />
            {cd.projectedFee}{' '}
            <strong className="text-emerald-400">
              R$ {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR')},00
            </strong>
          </div>
        </div>
      )}

      {/* Detalhes Parcelamento com Escolha de Vencimento */}
      {feeModel === 'FIXED_INSTALLMENT' && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">{cd.fixedTotalAmount}</span>
              <input
                type="number"
                step={100}
                value={fixedAmount}
                onChange={(e) => setFixedAmount(Number(e.target.value))}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">{cd.installmentsCount}</span>
              <input
                type="number"
                min={1}
                max={24}
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{cd.firstDueDateLabel}</span>
              </label>
              <input
                type="date"
                value={firstDueDate}
                onChange={(e) => {
                  setFirstDueDate(e.target.value);
                  const day = Number(e.target.value.split('-')[2]);
                  if (day && !isNaN(day)) setRecurringDueDay(day);
                }}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-medium cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{cd.subsequentDueDayLabel}</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">{cd.dueDayEveryMonth}</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={recurringDueDay}
                  onChange={(e) => setRecurringDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-800/80 p-2 rounded leading-relaxed border border-white/5 space-y-0.5">
            <div className="text-slate-300">
              <strong>{cd.firstInstallmentSummary}</strong> {formattedFirstDueDate} ({Math.round(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
            </div>
            {installmentsCount > 1 && (
              <div className="text-emerald-400 font-semibold">
                {cd.subsequentInstallmentsSummary.replace('{count}', String(installmentsCount - 1)).replace('{day}', String(recurringDueDay))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detalhes Híbrido com Escolha de Vencimento e Êxito */}
      {feeModel === 'HYBRID' && (
        <div className="space-y-2.5 pt-1">
          <div className="space-y-2 bg-slate-800/60 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-amber-300 block uppercase">
              1. Entrada / Pro Labore
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">{cd.fixedTotalAmount}</span>
                <input
                  type="number"
                  step={100}
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">{cd.installmentsCount}</span>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{cd.firstDueDateLabel}</span>
                </label>
                <input
                  type="date"
                  value={firstDueDate}
                  onChange={(e) => {
                    setFirstDueDate(e.target.value);
                    const day = Number(e.target.value.split('-')[2]);
                    if (day && !isNaN(day)) setRecurringDueDay(day);
                  }}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-medium cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{cd.subsequentDueDayLabel}</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">{cd.dueDayEveryMonth}</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={recurringDueDay}
                    onChange={(e) => setRecurringDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-bold text-center"
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded leading-relaxed border border-white/5 space-y-0.5">
              <div>
                <strong>{cd.firstInstallmentSummary}</strong> {formattedFirstDueDate} ({Math.round(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
              </div>
              {installmentsCount > 1 && (
                <div className="text-emerald-400 font-semibold">
                  {cd.subsequentInstallmentsSummary.replace('{count}', String(installmentsCount - 1)).replace('{day}', String(recurringDueDay))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-800/60 p-2.5 rounded-lg border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold text-[#C89543] uppercase">
                2. Êxito sobre atrasados
              </span>
              <span className="font-bold text-[#C89543]">{quotaLitisPercentage}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={quotaLitisPercentage}
              onChange={(e) => setQuotaLitisPercentage(Number(e.target.value))}
              className="w-full accent-[#C89543] cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 bg-slate-800/80 p-2 rounded">
              {cd.estimatedRetroactive} R$ {estimatedRetroactive.toLocaleString('pt-BR')},00 <br />
              {cd.projectedFee}{' '}
              <strong className="text-emerald-400">
                R$ {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR')},00
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
