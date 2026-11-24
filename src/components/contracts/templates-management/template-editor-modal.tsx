'use client';

import React from 'react';
import {
  X,
  Edit3,
  FileSignature,
  Layers,
  UserCheck,
} from 'lucide-react';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import {
  BENEFIT_CATALOG_OPTIONS,
  DOCUMENT_CATEGORY_OPTIONS,
} from '@/lib/utils/benefit-translations';
import { TemplatePlaceholdersToolbar } from './template-placeholders-toolbar';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplateId: string | null;
  title: string;
  setTitle: (val: string) => void;
  documentCategory: DocumentCategory;
  onCategoryChange: (cat: DocumentCategory) => void;
  customCategoryName: string;
  setCustomCategoryName: (val: string) => void;
  benefitSpecies: string;
  setBenefitSpecies: (val: string) => void;
  customBenefitName: string;
  setCustomBenefitName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  defaultFeeModel: FeeModel;
  setDefaultFeeModel: (val: FeeModel) => void;
  defaultPercentage: number;
  setDefaultPercentage: (val: number) => void;
  clausesCount: number;
  setClausesCount: (val: number) => void;
  contentBody: string;
  setContentBody: (val: string) => void;
  lawyerName: string;
  setLawyerName: (val: string) => void;
  lawyerOab: string;
  setLawyerOab: (val: string) => void;
  isDefault: boolean;
  setIsDefault: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  locale: string;
}

export function TemplateEditorModal({
  isOpen,
  onClose,
  editingTemplateId,
  title,
  setTitle,
  documentCategory,
  onCategoryChange,
  customCategoryName,
  setCustomCategoryName,
  benefitSpecies,
  setBenefitSpecies,
  customBenefitName,
  setCustomBenefitName,
  description,
  setDescription,
  defaultFeeModel,
  setDefaultFeeModel,
  defaultPercentage,
  setDefaultPercentage,
  clausesCount,
  setClausesCount,
  contentBody,
  setContentBody,
  lawyerName,
  setLawyerName,
  lawyerOab,
  setLawyerOab,
  isDefault,
  setIsDefault,
  onSubmit,
  locale,
}: TemplateEditorModalProps) {
  if (!isOpen) return null;
  const isEn = locale === 'en-US';

  const handleInsertTag = (tag: string) => {
    setContentBody(`${contentBody} ${tag}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-base text-[#082A52] flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#C89543]" />
            <span>
              {editingTemplateId
                ? isEn
                  ? 'Edit Law Firm Template'
                  : 'Editar Minuta do Escritório'
                : isEn
                ? 'Create New Standard Template'
                : 'Cadastrar Nova Minuta Padrão'}
            </span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Document Category & Benefit Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <FileSignature className="w-3.5 h-3.5 text-[#0B78D0]" />
                <span>{isEn ? 'Document Type / Template *' : 'Tipo de Documento / Minuta *'}</span>
              </label>
              <select
                value={documentCategory}
                onChange={(e) => onCategoryChange(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-semibold"
              >
                {DOCUMENT_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#0B78D0]" />
                <span>{isEn ? 'Benefit / Template Purpose *' : 'Benefício / Objeto da Minuta *'}</span>
              </label>
              <select
                value={benefitSpecies}
                onChange={(e) => setBenefitSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
              >
                {BENEFIT_CATALOG_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional custom inputs for OTHER document type or OTHER benefit */}
          {documentCategory === 'OTHER' && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-[#082A52] uppercase">
                {isEn ? 'Specify Document Type / File *' : 'Especifique o Tipo do Documento / Arquivo *'}
              </label>
              <input
                type="text"
                required
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder={isEn ? 'e.g. Extrajudicial Notice, Partnership Agreement' : 'Ex: Notificação Extrajudicial, Contrato de Parceria, Termo de Acordo'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-semibold"
              />
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? 'This name will be used on badges, tags, and headers of this template.'
                  : 'Este nome será utilizado nos rótulos, badges e cabeçalhos desta minuta.'}
              </p>
            </div>
          )}

          {benefitSpecies === 'Outro Benefício' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-[#082A52] uppercase">
                {isEn ? 'Benefit Name / Specific Cause *' : 'Nome do Benefício / Causa Específica *'}
              </label>
              <input
                type="text"
                required
                value={customBenefitName}
                onChange={(e) => setCustomBenefitName(e.target.value)}
                placeholder={isEn ? 'e.g. Prison Allowance, Fishing Insurance' : 'Ex: Auxílio-Reclusão, Seguro Defeso, Salário-Família'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-semibold"
              />
            </div>
          )}

          {/* Title & Lawyer (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Template Title *' : 'Título Identificador da Minuta *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEn ? 'e.g. Standard Template — Rural Retirement w/ 30% Success Fee' : 'Ex: Minuta Padrão — Aposentadoria Rural c/ Quota Litis 30%'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
            />
          </div>

          {/* Optional Lawyer linking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#0B78D0]" />
                <span>{isEn ? 'Lead Attorney (Optional)' : 'Advogado(a) Titular (Opcional)'}</span>
              </label>
              <input
                type="text"
                value={lawyerName}
                onChange={(e) => setLawyerName(e.target.value)}
                placeholder={isEn ? 'Leave blank for Institutional Firm Template' : 'Deixe em branco para Minuta Geral do Escritório'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isEn ? 'Bar Association (OAB) (Optional)' : 'OAB do Advogado (Opcional)'}
              </label>
              <input
                type="text"
                value={lawyerOab}
                onChange={(e) => setLawyerOab(e.target.value)}
                placeholder={isEn ? 'e.g. OAB/AM 55.858' : 'Ex: OAB/AM 55.858'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
              />
            </div>
          </div>

          {/* Fee Regime only if documentCategory is FEE_CONTRACT */}
          {documentCategory === 'FEE_CONTRACT' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isEn ? 'Fee Regime' : 'Regime de Honorários'}
                </label>
                <select
                  value={defaultFeeModel}
                  onChange={(e) => setDefaultFeeModel(e.target.value as FeeModel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                >
                  <option value="QUOTA_LITIS">
                    {isEn ? 'Quota Litis (Success on back payments)' : 'Quota Litis (Êxito sobre atrasados)'}
                  </option>
                  <option value="FIXED_INSTALLMENT">
                    {isEn ? 'Fixed Installments' : 'Parcelamento Fixo / Carnê'}
                  </option>
                  <option value="HYBRID">
                    {isEn ? 'Hybrid (Down Payment + Success)' : 'Híbrido (Entrada + Êxito)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isEn ? 'Success Percentage (%)' : 'Percentual Quota Litis (%)'}
                </label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  disabled={defaultFeeModel === 'FIXED_INSTALLMENT'}
                  value={defaultPercentage}
                  onChange={(e) => setDefaultPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isEn ? 'Estimated Clauses' : 'Qtd. Cláusulas Estimada'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={clausesCount}
                  onChange={(e) => setClausesCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Is Default Checkbox */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefaultCheckbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-[#082A52] rounded border-slate-300 focus:ring-[#0B78D0] cursor-pointer"
            />
            <label htmlFor="isDefaultCheckbox" className="text-xs text-slate-700 font-semibold cursor-pointer">
              {isEn
                ? 'Set as Law Firm Standard Template (Replaces prior standard for this category and loads automatically).'
                : 'Definir como Modelo Padrão do Escritório (Substitui o padrão anterior para esta categoria/benefício e carrega automaticamente nos novos atendimentos).'}
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Short Template Description' : 'Descrição Curta do Modelo'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isEn ? 'e.g. Standard template with full legal clauses.' : 'Ex: Minuta padrão com cláusulas completas de prova material e destacamento de honorários.'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
            />
          </div>

          {/* Dynamic Placeholders Toolbar */}
          <TemplatePlaceholdersToolbar onInsertTag={handleInsertTag} locale={locale} />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isEn ? 'Document Body & Clauses *' : 'Corpo do Documento & Cláusulas *'}
            </label>
            <textarea
              required
              rows={9}
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              placeholder={isEn ? 'Write or paste document clauses here...' : 'Escreva ou cole as cláusulas do documento aqui...'}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-xs cursor-pointer"
            >
              {editingTemplateId
                ? isEn
                  ? 'Save Changes'
                  : 'Salvar Alterações da Minuta'
                : isEn
                ? 'Save Standard Template'
                : 'Salvar Nova Minuta Padrão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
