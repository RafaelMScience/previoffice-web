'use client';

import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { ContractTemplate } from '@/types/contract';
import {
  formatBenefitType,
  formatDocumentCategory,
} from '@/lib/utils/benefit-translations';

interface TemplatePreviewModalProps {
  template: ContractTemplate | null;
  onClose: () => void;
  onCopyClauses: (template: ContractTemplate) => void;
  onSelectTemplateForNewContract: (template: ContractTemplate) => void;
  isCopied: boolean;
  locale: string;
}

export function TemplatePreviewModal({
  template,
  onClose,
  onCopyClauses,
  onSelectTemplateForNewContract,
  isCopied,
  locale,
}: TemplatePreviewModalProps) {
  if (!template) return null;
  const isEn = locale === 'en-US';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#082A52] text-white">
                {formatDocumentCategory(
                  template.documentCategory,
                  template.customCategoryName
                )}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                {formatBenefitType(template.benefitSpecies, isEn ? 'en-US' : 'pt-BR')}
              </span>
            </div>
            <h4 className="font-bold text-base text-[#082A52]">
              {template.title}
            </h4>
            <p className="text-xs text-slate-500">
              {template.clausesCount} {isEn ? 'Clauses' : 'Cláusulas'} •{' '}
              {template.lawyerName
                ? `${template.lawyerName} (${template.lawyerOab || 'OAB'})`
                : isEn
                ? 'Institutional Law Firm Template'
                : 'Minuta Institucional do Escritório'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 leading-relaxed bg-slate-50/50 whitespace-pre-wrap">
          {template.contentBody}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onCopyClauses(template)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
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
                ? 'Copy Clauses'
                : 'Copiar Cláusulas'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTemplateForNewContract(template);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold cursor-pointer"
          >
            <span>
              {isEn
                ? 'Use this Template for New Contract'
                : 'Usar esta Minuta para Novo Contrato'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
