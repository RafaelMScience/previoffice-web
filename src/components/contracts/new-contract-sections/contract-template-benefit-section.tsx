'use client';

import React from 'react';
import { Sparkles, Layers } from 'lucide-react';
import type { ContractTemplate } from '@/types/contract';
import { formatDocumentCategory } from '@/lib/utils/benefit-translations';

interface ContractTemplateBenefitSectionProps {
  templates: ContractTemplate[];
  templateId: string;
  onTemplateChange: (tplId: string) => void;
  benefitSpecies: string;
  onBenefitChange: (val: string) => void;
  onBenefitBlur: () => void;
  locale: string;
}

export function ContractTemplateBenefitSection({
  templates,
  templateId,
  onTemplateChange,
  benefitSpecies,
  onBenefitChange,
  onBenefitBlur,
  locale,
}: ContractTemplateBenefitSectionProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
          <span>{isEn ? '2. Linked Standard Template' : '2. Minuta Padrão Vinculada'}</span>
        </label>
        <select
          value={templateId}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-medium"
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.isDefault ? (isEn ? '★ [DEFAULT] ' : '★ [PADRÃO] ') : ''}
              {formatDocumentCategory(tpl.documentCategory, tpl.customCategoryName)}: {tpl.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#0B78D0]" />
          <span>{isEn ? 'Benefit / Contractual Scope *' : 'Benefício / Objeto Contratual *'}</span>
        </label>
        <input
          type="text"
          required
          value={benefitSpecies}
          onChange={(e) => onBenefitChange(e.target.value)}
          onBlur={onBenefitBlur}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
        />
      </div>
    </div>
  );
}
