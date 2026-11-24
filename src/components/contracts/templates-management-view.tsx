'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { BENEFIT_CATALOG_OPTIONS } from '@/lib/utils/benefit-translations';
import { useDebounce } from '@/hooks/use-debounce';
import {
  TemplateCard,
  TemplatePreviewModal,
  TemplateEditorModal,
} from './templates-management';

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
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const isEn = locale === 'en-US';

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
        tenantId: currentUser?.tenantId || '',
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
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-[#082A52] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C89543]" />
            <span>{t.contracts.templatesTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t.contracts.templatesSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C89543]" />
          <span>{t.contracts.btnNewTemplate}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isEn
              ? 'Search templates by title, benefit species (e.g. Rural, LOAS), or document type...'
              : 'Pesquisar minutas por título, benefício (ex: Rural, LOAS, Urbano) ou tipo de documento...'
          }
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 focus:border-[#0B78D0] transition-all shadow-inner"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            isCopied={copiedId === tpl.id}
            onOpenEditModal={handleOpenEditModal}
            onOpenPreviewModal={setSelectedTemplateForPreview}
            onCopyClauses={handleCopyClauses}
            onSelectTemplateForNewContract={onSelectTemplateForNewContract}
            locale={locale}
          />
        ))}
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplateForPreview}
        onClose={() => setSelectedTemplateForPreview(null)}
        onCopyClauses={handleCopyClauses}
        onSelectTemplateForNewContract={onSelectTemplateForNewContract}
        isCopied={Boolean(
          selectedTemplateForPreview && copiedId === selectedTemplateForPreview.id
        )}
        locale={locale}
      />

      {/* Edit or Create Template Modal */}
      <TemplateEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTemplateId={editingTemplateId}
        title={title}
        setTitle={setTitle}
        documentCategory={documentCategory}
        onCategoryChange={handleCategoryChange}
        customCategoryName={customCategoryName}
        setCustomCategoryName={setCustomCategoryName}
        benefitSpecies={benefitSpecies}
        setBenefitSpecies={setBenefitSpecies}
        customBenefitName={customBenefitName}
        setCustomBenefitName={setCustomBenefitName}
        description={description}
        setDescription={setDescription}
        defaultFeeModel={defaultFeeModel}
        setDefaultFeeModel={setDefaultFeeModel}
        defaultPercentage={defaultPercentage}
        setDefaultPercentage={setDefaultPercentage}
        clausesCount={clausesCount}
        setClausesCount={setClausesCount}
        contentBody={contentBody}
        setContentBody={setContentBody}
        lawyerName={lawyerName}
        setLawyerName={setLawyerName}
        lawyerOab={lawyerOab}
        setLawyerOab={setLawyerOab}
        isDefault={isDefault}
        setIsDefault={setIsDefault}
        onSubmit={handleSubmit}
        locale={locale}
      />
    </div>
  );
}
