'use client';

import React from 'react';
import {
  FileText,
  Copy,
  Check,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  Edit3,
  Scale,
  FileSignature,
  Building2,
} from 'lucide-react';
import type { ContractTemplate } from '@/types/contract';
import {
  formatBenefitType,
  formatDocumentCategory,
} from '@/lib/utils/benefit-translations';

interface TemplateCardProps {
  template: ContractTemplate;
  isCopied: boolean;
  onOpenEditModal: (template: ContractTemplate) => void;
  onOpenPreviewModal: (template: ContractTemplate) => void;
  onCopyClauses: (template: ContractTemplate) => void;
  onSelectTemplateForNewContract: (template: ContractTemplate) => void;
  locale: string;
}

export function TemplateCard({
  template,
  isCopied,
  onOpenEditModal,
  onOpenPreviewModal,
  onCopyClauses,
  onSelectTemplateForNewContract,
  locale,
}: TemplateCardProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#0B78D0]/40 transition-all p-5 flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Document Category Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20">
              <FileSignature className="w-3 h-3 text-[#C89543]" />
              <span>
                {formatDocumentCategory(
                  template.documentCategory,
                  template.customCategoryName
                )}
              </span>
            </span>

            {/* Benefit Species Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
              <Layers className="w-3 h-3 text-[#0B78D0]" />
              <span>
                {formatBenefitType(template.benefitSpecies, isEn ? 'en-US' : 'pt-BR')}
              </span>
            </span>
          </div>

          {template.isDefault && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {isEn ? 'Standard Template' : 'Minuta Padrão'}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-bold text-sm text-[#082A52] group-hover:text-[#0B78D0] transition-colors leading-snug">
            {template.title}
          </h4>
          {template.lawyerName ? (
            <div className="text-[11px] text-[#0B78D0] font-semibold flex items-center gap-1 mt-0.5">
              <Scale className="w-3 h-3 text-[#C89543]" />
              <span>
                {template.lawyerName} ({template.lawyerOab || 'OAB'})
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>
                {isEn
                  ? 'Institutional Law Firm Template'
                  : 'Minuta Institucional do Escritório'}
              </span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Excerpt box */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-600 max-h-24 overflow-hidden relative">
          <div className="line-clamp-3 whitespace-pre-line">{template.contentBody}</div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>

        {/* Metadata Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-[#C89543]" />
            <span>
              {template.defaultFeeModel === 'QUOTA_LITIS'
                ? `Quota Litis ${template.defaultQuotaLitisPercentage || 30}%`
                : template.defaultFeeModel === 'FIXED_INSTALLMENT'
                ? isEn
                  ? 'Fixed Installments'
                  : 'Parcelamento Fixo'
                : isEn
                ? 'Down Payment + Success'
                : 'Entrada + Êxito'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {template.clausesCount} {isEn ? 'Clauses' : 'Cláusulas'}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(template.updatedAt).toLocaleDateString(
                isEn ? 'en-US' : 'pt-BR'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Edit Template */}
          <button
            type="button"
            onClick={() => onOpenEditModal(template)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#082A52] transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#0B78D0]" />
            <span>{isEn ? 'Edit' : 'Editar'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPreviewModal(template)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEn ? 'View' : 'Ver'}</span>
          </button>

          <button
            type="button"
            onClick={() => onCopyClauses(template)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>
              {isCopied
                ? isEn
                  ? 'Copied!'
                  : 'Copiado!'
                : isEn
                ? 'Copy'
                : 'Copiar'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectTemplateForNewContract(template)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#C89543]" />
          <span>{isEn ? 'Use Template' : 'Usar Minuta'}</span>
        </button>
      </div>
    </div>
  );
}
