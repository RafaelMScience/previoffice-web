'use client';

import React from 'react';
import { Award } from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';
import type { SpecialCategory } from '@/types/client';
import { getCanonicalBenefitKey } from '@/lib/utils/benefit-translations';

export interface BenefitSectionProps {
  t: Translations;
  benefitType: string;
  setBenefitType: (val: string) => void;
  specialCategory: SpecialCategory;
  setSpecialCategory: (val: SpecialCategory) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export function BenefitSection({
  t,
  benefitType,
  setBenefitType,
  specialCategory,
  setSpecialCategory,
  notes,
  setNotes,
}: BenefitSectionProps) {
  return (
    <div id="benefit" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Award className="w-5 h-5 text-[#C89543]" />
        <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec5}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.clientForm.desiredBenefitLabel}
          </label>
          <select
            value={getCanonicalBenefitKey(benefitType)}
            onChange={(e) => setBenefitType(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
          >
            <option value="BPC/LOAS Elderly">BPC / LOAS - Idoso (≥ 65 anos)</option>
            <option value="BPC/LOAS Disability">BPC / LOAS - Pessoa com Deficiência (PCD)</option>
            <option value="Rural Special Retirement">Aposentadoria Rural - Segurado Especial</option>
            <option value="Age Retirement Urban">Aposentadoria Urbana por Idade</option>
            <option value="Temporary Disability">Benefício por Incapacidade Temporária (Auxílio-Doença)</option>
            <option value="Permanent Disability">Aposentadoria por Incapacidade Permanente</option>
            <option value="Death Pension">Pensão por Morte</option>
            <option value="Maternity Benefit">Salário-Maternidade Rural/Urbano</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.specialCategoryLabel}</label>
          <select
            value={specialCategory}
            onChange={(e) => setSpecialCategory(e.target.value as SpecialCategory)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          >
            <option value="URBAN_COMMON">{t.clientForm.catUrban}</option>
            <option value="RURAL">{t.clientForm.catRural}</option>
            <option value="PCD">{t.clientForm.catPcd}</option>
            <option value="SPECIAL_HAZARDOUS">{t.clientForm.catHazardous}</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.clientForm.notesLabel}
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.clientForm.notesPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
