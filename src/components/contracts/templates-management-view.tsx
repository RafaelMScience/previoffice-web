'use client';

import React, { useState, useMemo } from 'react';
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
  FileSignature,
  Building2,
} from 'lucide-react';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { TEMPLATE_PLACEHOLDERS } from '@/lib/utils/template-engine';
import {
  formatBenefitType,
  formatDocumentCategory,
  BENEFIT_CATALOG_OPTIONS,
  DOCUMENT_CATEGORY_OPTIONS,
} from '@/lib/utils/benefit-translations';
import { useDebounce } from '@/hooks/use-debounce';

interface TemplatesManagementViewProps {
  templates: ContractTemplate[];
  onSelectTemplateForNewContract: (template: ContractTemplate) => void;
  onAddNewTemplate: (template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate?: (template: ContractTemplate) => void;
}

export function TemplatesManagementView({
  templates,
  onSelectTemplateForNewContract,
  onAddNewTemplate,
  onUpdateTemplate,
}: TemplatesManagementViewProps) {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<ContractTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('FEE_CONTRACT');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [benefitSpecies, setBenefitSpecies] = useState<string>(BENEFIT_CATALOG_OPTIONS[0]);
  const [customBenefitName, setCustomBenefitName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultFeeModel, setDefaultFeeModel] = useState<FeeModel>('QUOTA_LITIS');
  const [defaultPercentage, setDefaultPercentage] = useState(30);
  const [clausesCount, setClausesCount] = useState(8);
  const [contentBody, setContentBody] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [lawyerOab, setLawyerOab] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  const filteredTemplates = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return templates;
    const term = debouncedSearchTerm.toLowerCase();
    return templates.filter(
      (tpl) =>
        tpl.title.toLowerCase().includes(term) ||
        tpl.benefitSpecies.toLowerCase().includes(term) ||
        tpl.description.toLowerCase().includes(term) ||
        (tpl.customCategoryName && tpl.customCategoryName.toLowerCase().includes(term)) ||
        (tpl.lawyerName && tpl.lawyerName.toLowerCase().includes(term))
    );
  }, [templates, debouncedSearchTerm]);

  const handleCopyClauses = (tpl: ContractTemplate) => {
    navigator.clipboard.writeText(tpl.contentBody);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCategoryChange = (category: DocumentCategory) => {
    setDocumentCategory(category);
    // If switching to power of attorney or hipo, adapt default clauses if user hasn't edited much
    if (category === 'POWER_OF_ATTORNEY' && (!contentBody || contentBody.includes('INSTRUMENTO PARTICULAR DE CONTRATO'))) {
      setContentBody(`PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: {{NOME_CLIENTE}}, brasileiro(a), {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, inscrito(a) no CPF/MF sob o nº {{CPF}}, portador(a) do RG nº {{RG}}, residente e domiciliado(a) em {{ENDERECO}}, telefone/WhatsApp: {{TELEFONE}}.

OUTORGADOS: Os advogados integrantes da SOCIEDADE DE ADVOGADOS, com endereço profissional onde recebem intimações e notificações de estilo.

PODERES: Pelo presente instrumento de mandato, o(a) OUTORGANTE confere aos OUTORGADOS amplos poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância, Tribunal ou Repartição Pública, especialmente perante o INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS), Ministério da Previdência Social, Caixa Econômica Federal e Banco do Brasil, podendo propor e acompanhar ações administrativas e judiciais em prol do benefício de {{BENEFICIO}}, praticando todos os atos necessários ao bom e fiel cumprimento deste mandato, inclusive confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, firmar compromissos, receber valores, dar e receber quitação, requerer expedição e levantamento de RPV e Precatórios, e substabelecer esta a outrem, com ou sem reserva de iguais poderes.

Localidade, {{DATA_EXTENSO}}.`);
      setClausesCount(4);
    } else if (category === 'DECLARATION_HIPO' && (!contentBody || contentBody.includes('INSTRUMENTO PARTICULAR DE CONTRATO'))) {
      setContentBody(`DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA (JUSTIÇA GRATUITA)

Eu, {{NOME_CLIENTE}}, brasileiro(a), {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, inscrito(a) no CPF/MF sob o nº {{CPF}}, portador(a) do RG nº {{RG}}, residente e domiciliado(a) em {{ENDERECO}},

DECLARO, sob as penas da lei e em conformidade com o artigo 98 e seguintes da Lei Federal nº 13.105/2015 (Código de Processo Civil) e artigo 5º, inciso LXXIV da Constituição Federal de 1988, que não possuo condições financeiras de arcar com as custas processuais, despesas judiciais e honorários advocatícios sem prejuízo do sustento próprio e de minha família.

Por ser a expressão da verdade, firmo a presente declaração para que produza seus regulares efeitos de direito perante os órgãos jurisdicionais competentes.

Localidade, {{DATA_EXTENSO}}.`);
      setClausesCount(2);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setTitle('');
    setDocumentCategory('FEE_CONTRACT');
    setCustomCategoryName('');
    setBenefitSpecies(BENEFIT_CATALOG_OPTIONS[0]);
    setCustomBenefitName('');
    setDescription('');
    setDefaultFeeModel('QUOTA_LITIS');
    setDefaultPercentage(30);
    setClausesCount(8);
    setContentBody(`INSTRUMENTO PARTICULAR DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS PROFISSIONAIS PREVIDENCIÁRIOS

Pelo presente instrumento particular, regido pela Lei Federal nº 8.906/1994 (Estatuto da OAB), pelos artigos 593 e seguintes e 653 e seguintes da Lei Federal nº 10.406/2002 (Código Civil), pelo Código de Ética e Disciplina da OAB e pela Lei Federal nº 8.213/1991:

CONTRATANTE: {{NOME_CLIENTE}}, brasileiro(a), {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, inscrito(a) no CPF/MF sob o nº {{CPF}}, portador(a) do RG nº {{RG}}, residente em {{ENDERECO}}, telefone/WhatsApp: {{TELEFONE}}.
CONTRATADA: SOCIEDADE DE ADVOGADOS, sob representação técnica dos advogados atuantes.

CLÁUSULA 1ª — DO OBJETO: Prestação de serviços jurídicos e representação técnica profissional para requerimento, concessão e liquidação do benefício de {{BENEFICIO}} (Pasta: {{PASTA_FISICA}}), na via administrativa (INSS) e judicial (Justiça Federal/Estadual).
Parágrafo Único — A atuação profissional constitui obrigação de meio e não de resultado (art. 14 do Código de Ética e Disciplina da OAB).

CLÁUSULA 2ª — DOS HONORÁRIOS CONTRATUAIS: Pelos serviços prestados, com amparo no art. 22 da Lei nº 8.906/1994 e art. 50 do Código de Ética da OAB, o(a) CONTRATANTE pagará à CONTRATADA:
{{HONORARIOS}}
§ 1º — A base de cálculo incidirá sobre a totalidade das parcelas retroativas apuradas da DER até a efetiva concessão e liquidação.
§ 2º — Em caso de indeferimento definitivo sem proveito econômico obtido, nenhum valor a título de honorários de êxito será devido.

CLÁUSULA 3ª — DO DESTACAMENTO DE HONORÁRIOS EM RPV / PRECATÓRIO (ART. 22, § 4º DA LEI 8.906/94):
Autorização expressa para requisição e destacamento prévio da verba honorária diretamente em favor da sociedade de advogados na fonte pagadora (Caixa Econômica Federal / Banco do Brasil), bem como levantamento de alvarás com imediata prestação de contas.

CLÁUSULA 4ª — DOS HONORÁRIOS DE SUCUMBÊNCIA: Pertencem exclusivamente à CONTRATADA (art. 23 da Lei 8.906/94 e art. 85, § 14 do CPC).

CLÁUSULA 5ª — DA RESCISÃO E ACORDO DIRETO: Aplicação dos arts. 22 da Lei 8.906/94 e 658 do Código Civil em caso de revogação sem justa causa ou transação direta à revelia dos patronos.

CLÁUSULA 6ª — DA PROTEÇÃO DE DADOS (LGPD): Tratamento estrito nos moldes do art. 7º, V e VI da Lei Federal nº 13.709/2018.

CLÁUSULA 7ª — DA EFICÁCIA EXECUTIVA E DO FORO: Título executivo extrajudicial (art. 784, III do CPC e art. 24 da Lei 8.906/94), elegendo-se o foro do domicílio do(a) CONTRATANTE.

Localidade, {{DATA_EXTENSO}}.`);
    setLawyerName('');
    setLawyerOab('');
    setIsDefault(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: ContractTemplate) => {
    setEditingTemplateId(tpl.id);
    setTitle(tpl.title);
    setDocumentCategory(tpl.documentCategory || 'FEE_CONTRACT');
    setCustomCategoryName(tpl.customCategoryName || '');
    
    // Check if benefitSpecies is in catalog or custom
    const isInCatalog = BENEFIT_CATALOG_OPTIONS.includes(tpl.benefitSpecies as any);
    if (isInCatalog) {
      setBenefitSpecies(tpl.benefitSpecies);
      setCustomBenefitName('');
    } else {
      setBenefitSpecies('Outro Benefício');
      setCustomBenefitName(tpl.benefitSpecies);
    }

    setDescription(tpl.description);
    setDefaultFeeModel(tpl.defaultFeeModel);
    setDefaultPercentage(tpl.defaultQuotaLitisPercentage || 30);
    setClausesCount(tpl.clausesCount || 8);
    setContentBody(tpl.contentBody);
    setLawyerName(tpl.lawyerName || '');
    setLawyerOab(tpl.lawyerOab || '');
    setIsDefault(Boolean(tpl.isDefault));
    setIsModalOpen(true);
  };

  const handleInsertTag = (tag: string) => {
    setContentBody((prev) => `${prev} ${tag}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contentBody) return;

    const resolvedBenefit =
      benefitSpecies === 'Outro Benefício' && customBenefitName.trim()
        ? customBenefitName.trim()
        : benefitSpecies;

    const trimmedLawyer = lawyerName.trim() ? lawyerName.trim() : undefined;
    const trimmedOab = trimmedLawyer && lawyerOab.trim() ? lawyerOab.trim() : undefined;

    if (editingTemplateId && onUpdateTemplate) {
      const existing = templates.find((t) => t.id === editingTemplateId);
      if (existing) {
        onUpdateTemplate({
          ...existing,
          title,
          documentCategory,
          customCategoryName: documentCategory === 'OTHER' ? customCategoryName.trim() : undefined,
          benefitSpecies: resolvedBenefit,
          description,
          defaultFeeModel,
          defaultQuotaLitisPercentage: defaultFeeModel !== 'FIXED_INSTALLMENT' ? defaultPercentage : 0,
          clausesCount: Number(clausesCount) || 8,
          contentBody,
          lawyerName: trimmedLawyer,
          lawyerOab: trimmedOab,
          isDefault,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      onAddNewTemplate({
        tenantId: currentUser?.tenantId || 'tenant-001',
        title,
        documentCategory,
        customCategoryName: documentCategory === 'OTHER' ? customCategoryName.trim() : undefined,
        benefitSpecies: resolvedBenefit,
        description,
        defaultFeeModel,
        defaultQuotaLitisPercentage: defaultFeeModel !== 'FIXED_INSTALLMENT' ? defaultPercentage : 0,
        clausesCount: Number(clausesCount) || 8,
        contentBody,
        lawyerName: trimmedLawyer,
        lawyerOab: trimmedOab,
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
            Gerencie os contratos, procurações e declarações padrão do seu escritório com tags inteligentes ({'{{NOME_CLIENTE}}'}, {'{{HONORARIOS}}'}, etc.), isoladas com segurança e preenchidas automaticamente em cada atendimento.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
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
          placeholder="Pesquisar minutas por título, benefício (ex: Rural, LOAS, Urbano) ou tipo de documento..."
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
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Document Category Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20">
                      <FileSignature className="w-3 h-3 text-[#C89543]" />
                      <span>{formatDocumentCategory(tpl.documentCategory, tpl.customCategoryName)}</span>
                    </span>

                    {/* Benefit Species Badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      <Layers className="w-3 h-3 text-[#0B78D0]" />
                      <span>{formatBenefitType(tpl.benefitSpecies, 'pt-BR')}</span>
                    </span>
                  </div>

                  {tpl.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Minuta Padrão
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#082A52] group-hover:text-[#0B78D0] transition-colors leading-snug">
                    {tpl.title}
                  </h4>
                  {tpl.lawyerName ? (
                    <div className="text-[11px] text-[#0B78D0] font-semibold flex items-center gap-1 mt-0.5">
                      <Scale className="w-3 h-3 text-[#C89543]" />
                      <span>{tpl.lawyerName} ({tpl.lawyerOab || 'OAB'})</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>Minuta Institucional do Escritório</span>
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
                    <span>{tpl.clausesCount} Cláusulas</span>
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
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#082A52] transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplateForPreview(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyClauses(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold transition-all shadow-xs cursor-pointer"
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#082A52] text-white">
                    {formatDocumentCategory(
                      selectedTemplateForPreview.documentCategory,
                      selectedTemplateForPreview.customCategoryName
                    )}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                    {formatBenefitType(selectedTemplateForPreview.benefitSpecies, 'pt-BR')}
                  </span>
                </div>
                <h4 className="font-bold text-base text-[#082A52]">
                  {selectedTemplateForPreview.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedTemplateForPreview.clausesCount} Cláusulas •{' '}
                  {selectedTemplateForPreview.lawyerName
                    ? `${selectedTemplateForPreview.lawyerName} (${selectedTemplateForPreview.lawyerOab || 'OAB'})`
                    : 'Minuta Institucional do Escritório'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplateForPreview(null)}
                aria-label="Fechar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold cursor-pointer"
              >
                <span>Usar esta Minuta para Novo Contrato</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit or Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="font-bold text-base text-[#082A52] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C89543]" />
                <span>
                  {editingTemplateId ? 'Editar Minuta do Escritório' : 'Cadastrar Nova Minuta Padrão'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Document Category & Benefit Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <FileSignature className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <span>Tipo de Documento / Minuta *</span>
                  </label>
                  <select
                    value={documentCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as DocumentCategory)}
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
                    <span>Benefício / Objeto da Minuta *</span>
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
                    Especifique o Tipo do Documento / Arquivo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="Ex: Notificação Extrajudicial, Contrato de Parceria, Termo de Acordo"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-semibold"
                  />
                  <p className="text-[11px] text-slate-500">
                    Este nome será utilizado nos rótulos, badges e cabeçalhos desta minuta.
                  </p>
                </div>
              )}

              {benefitSpecies === 'Outro Benefício' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="block text-xs font-bold text-[#082A52] uppercase">
                    Nome do Benefício / Causa Específica *
                  </label>
                  <input
                    type="text"
                    required
                    value={customBenefitName}
                    onChange={(e) => setCustomBenefitName(e.target.value)}
                    placeholder="Ex: Auxílio-Reclusão, Seguro Defeso, Salário-Família"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-semibold"
                  />
                </div>
              )}

              {/* Title & Lawyer (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título Identificador da Minuta *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Minuta Padrão — Aposentadoria Rural c/ Quota Litis 30%"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                />
              </div>

              {/* Optional Lawyer linking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <span>Advogado(a) Titular (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={lawyerName}
                    onChange={(e) => setLawyerName(e.target.value)}
                    placeholder="Deixe em branco para Minuta Geral do Escritório"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    OAB do Advogado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={lawyerOab}
                    onChange={(e) => setLawyerOab(e.target.value)}
                    placeholder="Ex: OAB/AM 55.858"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
                  />
                </div>
              </div>

              {/* Fee Regime only if documentCategory is FEE_CONTRACT */}
              {documentCategory === 'FEE_CONTRACT' && (
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
                  Definir como Modelo Padrão do Escritório (Substitui o padrão anterior para esta categoria/benefício e carrega automaticamente nos novos atendimentos).
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
                  placeholder="Ex: Minuta padrão com cláusulas completas de prova material e destacamento de honorários."
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
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-blue-50 border border-slate-300 hover:border-[#0B78D0] text-[10px] font-mono text-slate-700 hover:text-[#0B78D0] transition-colors shadow-2xs cursor-pointer"
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
                  Corpo do Documento & Cláusulas *
                </label>
                <textarea
                  required
                  rows={9}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Escreva ou cole as cláusulas do documento aqui..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow cursor-pointer"
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
