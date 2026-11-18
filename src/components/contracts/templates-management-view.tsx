'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Copy,
  Check,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Eye,
  X,
  Edit3,
  UserCheck,
  Tag,
  Scale,
} from 'lucide-react';
import type { ContractTemplate, FeeModel } from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { TEMPLATE_PLACEHOLDERS } from '@/lib/utils/template-engine';

interface TemplatesManagementViewProps {
  templates: ContractTemplate[];
  onSelectTemplateForNewContract: (template: ContractTemplate) => void;
  onAddNewTemplate: (template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate?: (template: ContractTemplate) => void;
}

const LAWYER_OPTIONS = [
  { name: 'Dr. Alexandre Pontes', oab: 'OAB/PB 18.234' },
  { name: 'Dra. Camila Santos', oab: 'OAB/PB 22.100' },
  { name: 'Dr. Marcos Oliveira', oab: 'OAB/PB 19.450' },
  { name: 'Geral do Escritório (Todos os Advogados)', oab: 'Sociedade de Advogados' },
];

export function TemplatesManagementView({
  templates,
  onSelectTemplateForNewContract,
  onAddNewTemplate,
  onUpdateTemplate,
}: TemplatesManagementViewProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<ContractTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [benefitSpecies, setBenefitSpecies] = useState('Aposentadoria por Idade');
  const [description, setDescription] = useState('');
  const [defaultFeeModel, setDefaultFeeModel] = useState<FeeModel>('QUOTA_LITIS');
  const [defaultPercentage, setDefaultPercentage] = useState(30);
  const [clausesCount, setClausesCount] = useState(8);
  const [contentBody, setContentBody] = useState('');
  const [lawyerName, setLawyerName] = useState(LAWYER_OPTIONS[0].name);
  const [lawyerOab, setLawyerOab] = useState(LAWYER_OPTIONS[0].oab);
  const [isDefault, setIsDefault] = useState(true);

  const filteredTemplates = templates.filter((tpl) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      tpl.title.toLowerCase().includes(term) ||
      tpl.benefitSpecies.toLowerCase().includes(term) ||
      tpl.description.toLowerCase().includes(term) ||
      (tpl.lawyerName && tpl.lawyerName.toLowerCase().includes(term))
    );
  });

  const handleCopyClauses = (tpl: ContractTemplate) => {
    navigator.clipboard.writeText(tpl.contentBody);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setTitle('');
    setBenefitSpecies('Aposentadoria por Idade');
    setDescription('');
    setDefaultFeeModel('QUOTA_LITIS');
    setDefaultPercentage(30);
    setClausesCount(8);
    setContentBody(`CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS PREVIDENCIÁRIOS

CONTRATANTE: {{NOME_CLIENTE}}, CPF: {{CPF}}, residente em {{ENDERECO}}.
CONTRATADA: {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Prestação de serviços jurídicos para concessão de {{BENEFICIO}}.
CLÁUSULA 2ª — DOS HONORÁRIOS: {{HONORARIOS}}.
CLÁUSULA 3ª — DA RPV/PRECATÓRIO: Autorização expressa para retenção e destacamento de honorários contratuais diretamente na fonte pagadora (art. 22 § 4º da Lei 8.906/94).

Localidade, {{DATA_EXTENSO}}.`);
    setLawyerName(LAWYER_OPTIONS[0].name);
    setLawyerOab(LAWYER_OPTIONS[0].oab);
    setIsDefault(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: ContractTemplate) => {
    setEditingTemplateId(tpl.id);
    setTitle(tpl.title);
    setBenefitSpecies(tpl.benefitSpecies);
    setDescription(tpl.description);
    setDefaultFeeModel(tpl.defaultFeeModel);
    setDefaultPercentage(tpl.defaultQuotaLitisPercentage || 30);
    setClausesCount(tpl.clausesCount || 8);
    setContentBody(tpl.contentBody);
    setLawyerName(tpl.lawyerName || LAWYER_OPTIONS[0].name);
    setLawyerOab(tpl.lawyerOab || LAWYER_OPTIONS[0].oab);
    setIsDefault(Boolean(tpl.isDefault));
    setIsModalOpen(true);
  };

  const handleLawyerSelect = (name: string) => {
    setLawyerName(name);
    const found = LAWYER_OPTIONS.find((l) => l.name === name);
    if (found) setLawyerOab(found.oab);
  };

  const handleInsertTag = (tag: string) => {
    setContentBody((prev) => `${prev} ${tag}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contentBody) return;

    if (editingTemplateId && onUpdateTemplate) {
      const existing = templates.find((t) => t.id === editingTemplateId);
      if (existing) {
        onUpdateTemplate({
          ...existing,
          title,
          benefitSpecies,
          description,
          defaultFeeModel,
          defaultQuotaLitisPercentage: defaultFeeModel !== 'FIXED_INSTALLMENT' ? defaultPercentage : 0,
          clausesCount: Number(clausesCount) || 8,
          contentBody,
          lawyerName,
          lawyerOab,
          isDefault,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      onAddNewTemplate({
        tenantId: 'tenant-001',
        title,
        benefitSpecies,
        description,
        defaultFeeModel,
        defaultQuotaLitisPercentage: defaultFeeModel !== 'FIXED_INSTALLMENT' ? defaultPercentage : 0,
        clausesCount: Number(clausesCount) || 8,
        contentBody,
        lawyerName,
        lawyerOab,
        isDefault,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-[#082A52] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C89543]" />
            <span>Biblioteca de Minutas & Modelos Padrão do Escritório</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cada advogado da banca pode manter e editar seus próprios contratos padrão com tags inteligentes ({'{{NOME_CLIENTE}}'}, {'{{HONORARIOS}}'}, etc.), que são preenchidas automaticamente ao atender cada cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C89543]" />
          <span>Cadastrar Nova Minuta Padrão</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar minutas por título, benefício (ex: Rural, LOAS, Urbano) ou advogado titular..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 focus:border-[#0B78D0] transition-all shadow-inner"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => {
          const isCopied = copiedId === tpl.id;
          return (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0B78D0]/40 transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    <Layers className="w-3 h-3 text-[#0B78D0]" />
                    <span>{tpl.benefitSpecies}</span>
                  </div>

                  {tpl.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Minuta Padrão
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#082A52] group-hover:text-[#0B78D0] transition-colors leading-snug">
                    {tpl.title}
                  </h4>
                  {tpl.lawyerName && (
                    <div className="text-[11px] text-[#0B78D0] font-semibold flex items-center gap-1 mt-0.5">
                      <Scale className="w-3 h-3 text-[#C89543]" />
                      <span>{tpl.lawyerName} ({tpl.lawyerOab || 'OAB/PB'})</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                {/* Excerpt box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-600 max-h-24 overflow-hidden relative">
                  <div className="line-clamp-3 whitespace-pre-line">{tpl.contentBody}</div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-50 to-transparent" />
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>
                      {tpl.defaultFeeModel === 'QUOTA_LITIS'
                        ? `Quota Litis ${tpl.defaultQuotaLitisPercentage || 30}%`
                        : tpl.defaultFeeModel === 'FIXED_INSTALLMENT'
                        ? 'Parcelamento Fixo'
                        : 'Entrada + Êxito'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tpl.clausesCount} Cláusulas OAB</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(tpl.updatedAt).toLocaleDateString('pt-BR')}
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
                    onClick={() => handleOpenEditModal(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#082A52] transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplateForPreview(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyClauses(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTemplateForNewContract(tpl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-[#C89543]" />
                  <span>Usar Minuta</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {selectedTemplateForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-[#082A52]">
                  {selectedTemplateForPreview.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedTemplateForPreview.benefitSpecies} • {selectedTemplateForPreview.clausesCount} Cláusulas • {selectedTemplateForPreview.lawyerName || 'Geral'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplateForPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 leading-relaxed bg-slate-50/50 whitespace-pre-wrap">
              {selectedTemplateForPreview.contentBody}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyClauses(selectedTemplateForPreview)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Cláusulas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTemplateForNewContract(selectedTemplateForPreview);
                  setSelectedTemplateForPreview(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold"
              >
                <span>Usar esta Minuta para Novo Contrato</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit or Create Template Modal with Tags Toolbar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-base text-[#082A52] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C89543]" />
                <span>
                  {editingTemplateId ? 'Editar Minuta Padrão do Advogado' : 'Cadastrar Nova Minuta Padrão'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título Identificador da Minuta *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Minuta Padrão — Aposentadoria Rural c/ Quota Litis 30% (Dr. Alexandre)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <span>Advogado Titular Responsável</span>
                  </label>
                  <select
                    value={lawyerName}
                    onChange={(e) => handleLawyerSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                  >
                    {LAWYER_OPTIONS.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.name} ({l.oab})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Espécie de Benefício / Ramo Previdenciário *
                  </label>
                  <input
                    type="text"
                    required
                    value={benefitSpecies}
                    onChange={(e) => setBenefitSpecies(e.target.value)}
                    placeholder="Ex: Aposentadoria por Idade Rural"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Regime de Honorários
                  </label>
                  <select
                    value={defaultFeeModel}
                    onChange={(e) => setDefaultFeeModel(e.target.value as FeeModel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                  >
                    <option value="QUOTA_LITIS">Quota Litis (Êxito sobre atrasados)</option>
                    <option value="FIXED_INSTALLMENT">Parcelamento Fixo / Carnê</option>
                    <option value="HYBRID">Híbrido (Entrada + Êxito)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Percentual Quota Litis (%)
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
                    Qtd. Cláusulas Estimada
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

              {/* Is Default Checkbox */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#082A52] rounded border-slate-300 focus:ring-[#0B78D0]"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Marcar como Minuta Padrão Ativa (Você pode ter mais de uma minuta padrão na banca para diferentes advogados ou espécies).
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descrição Curta do Modelo
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Modelo oficial do Dr. Alexandre com cláusulas de prova de segurado especial rural."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                />
              </div>

              {/* Dynamic Placeholders Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>Tags Inteligentes Disponíveis (Clique para inserir no texto)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Preenchidas na hora do atendimento</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                  {TEMPLATE_PLACEHOLDERS.map((ph) => (
                    <button
                      key={ph.tag}
                      type="button"
                      onClick={() => handleInsertTag(ph.tag)}
                      title={`${ph.description} (Ex: ${ph.example})`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-blue-50 border border-slate-300 hover:border-[#0B78D0] text-[10px] font-mono text-slate-700 hover:text-[#0B78D0] transition-colors shadow-2xs"
                    >
                      <span>+</span>
                      <strong className="text-[#082A52]">{ph.label}:</strong>
                      <span>{ph.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Corpo do Contrato & Cláusulas *
                </label>
                <textarea
                  required
                  rows={9}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Escreva ou cole as cláusulas do seu contrato aqui..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow"
                >
                  {editingTemplateId ? 'Salvar Alterações da Minuta' : 'Salvar Nova Minuta Padrão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
