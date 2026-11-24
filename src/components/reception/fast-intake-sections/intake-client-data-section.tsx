'use client';

import React from 'react';
import { User, Phone, CreditCard, Award } from 'lucide-react';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import type { Translations } from '@/lib/i18n/types';

interface IntakeClientDataSectionProps {
  fullName: string;
  onFullNameChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  cpf: string;
  onCpfChange: (val: string) => void;
  cpfValid: boolean;
  benefit: string;
  onBenefitChange: (val: string) => void;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  t: Translations;
  locale: string;
}

export function IntakeClientDataSection({
  fullName,
  onFullNameChange,
  phone,
  onPhoneChange,
  cpf,
  onCpfChange,
  cpfValid,
  benefit,
  onBenefitChange,
  nameInputRef,
  t,
  locale,
}: IntakeClientDataSectionProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="space-y-4">
      {/* 1. Nome Completo */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {t.fastIntake.fullNameLabel}
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={nameInputRef}
            type="text"
            required
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder={t.fastIntake.fullNamePlaceholder}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-medium"
          />
        </div>
      </div>

      {/* 2. Celular / WhatsApp */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {t.fastIntake.phoneLabel}
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            maxLength={15}
            value={phone}
            onChange={(e) => onPhoneChange(maskPhone(e.target.value))}
            placeholder={t.fastIntake.phonePlaceholder}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-mono"
          />
        </div>
      </div>

      {/* 3. CPF (Opcional) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-slate-700">
            {t.fastIntake.cpfLabel}
          </label>
          <span className="text-[10px] text-slate-400">
            {t.fastIntake.cpfOptionalNote}
          </span>
        </div>
        <div className="relative">
          <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            maxLength={14}
            value={cpf}
            onChange={(e) => onCpfChange(maskCpf(e.target.value))}
            placeholder={t.fastIntake.cpfPlaceholder}
            className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 transition-all font-mono ${
              !cpfValid
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-200 focus:ring-[#C89543] focus:bg-white'
            }`}
          />
        </div>
        {!cpfValid && (
          <span className="text-[11px] text-red-600 font-medium block mt-1">
            {t.fastIntake.cpfInvalid}
          </span>
        )}
      </div>

      {/* 4. Benefício Almejado */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {t.fastIntake.benefitLabel}
        </label>
        <div className="relative">
          <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={benefit}
            onChange={(e) => onBenefitChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-medium"
          >
            <option value="Rural Special Retirement">
              {isEn ? 'Rural Special Retirement' : 'Aposentadoria Rural - Segurado Especial'}
            </option>
            <option value="BPC/LOAS Elderly">
              {isEn ? 'BPC / LOAS - Elderly (≥ 65 yrs)' : 'BPC / LOAS - Idoso (≥ 65 anos)'}
            </option>
            <option value="BPC/LOAS Disability">
              {isEn ? 'BPC / LOAS - Person with Disability (PWD)' : 'BPC / LOAS - Pessoa com Deficiência (PCD)'}
            </option>
            <option value="Age Retirement Urban">
              {isEn ? 'Age Retirement Urban' : 'Aposentadoria Urbana por Idade'}
            </option>
            <option value="Temporary Disability">
              {isEn ? 'Temporary Disability (Sickness Aid)' : 'Benefício por Incapacidade (Auxílio-Doença)'}
            </option>
            <option value="Death Pension">
              {isEn ? 'Death Pension' : 'Pensão por Morte'}
            </option>
            <option value="Maternity Benefit">
              {isEn ? 'Maternity Benefit (Rural/Urban)' : 'Salário-Maternidade Rural/Urbano'}
            </option>
            <option value="General Query">
              {isEn ? 'General Query / Others' : 'Consulta Geral / Outros'}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
