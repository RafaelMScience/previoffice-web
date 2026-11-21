'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  FolderLock,
  CheckCircle2,
  Printer,
  Edit3,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  Scale,
  FileSignature,
  Eye,
  BookOpen,
  Columns,
  Layers,
  ArrowLeft,
  ListChecks,
  ChevronRight,
  Maximize2,
  FileSpreadsheet,
} from 'lucide-react';
import type { Client } from '@/types/client';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import {
  mergeTemplatePlaceholders,
  generateLawyerFeeClause,
  generateFeeInstallments,
} from '@/lib/utils/template-engine';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import { formatBenefitType, formatDocumentCategory } from '@/lib/utils/benefit-translations';

const MOCK_DEMO_CLIENT: Client = {
  id: '00000000-0000-0000-0000-000000000001',
  tenantId: 'tenant-001',
  fullName: 'Maria Francisca da Silva',
  normalizedName: 'MARIA FRANCISCA DA SILVA',
  cpf: '123.456.789-09',
  normalizedCpf: '12345678909',
  rg: '1.234.567 SSP/AM',
  birthDate: '1965-04-12',
  maritalStatus: 'MARRIED',
  profession: 'Agricultora / Segurada Especial Rural',
  nationality: 'Brasileira',
  street: 'Sítio Boa Esperança, Comunidade São Francisco, Zona Rural',
  streetNumber: 'S/N',
  neighborhood: 'Área Rural de Manacapuru',
  city: 'Manacapuru',
  state: 'AM',
  postalCode: '69400-000',
  phone: '(92) 98765-4321',
  mobilePhone: '(92) 98765-4321',
  email: 'maria.francisca@exemplo.com',
  physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
  benefitType: 'Aposentadoria por Idade Rural',
  visitCount: 2,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface GeneratedDocItem {
  id: string;
  templateId?: string;
  category: DocumentCategory | 'FOLDER_COVER';
  categoryLabel: string;
  title: string;
  description: string;
  content: string;
  isIncludedInKit: boolean;
  isEdited: boolean;
}

export default function DemoDocumentosPage() {
  // Model Toggle: 'model1' (Painel Lateral de Documentos & Kit) vs 'model2' (Split View Lado a Lado)
  const [activeModel, setActiveModel] = useState<'model1' | 'model2'>('model1');

  // Client info
  const client = MOCK_DEMO_CLIENT;
  const cabinetLocation = client.physicalFileLocation || 'Armário B - Gaveta 03 - Pasta 2026-042';

  // Fee state
  const [feeModel, setFeeModel] = useState<FeeModel>('QUOTA_LITIS');
  const [quotaLitisPercentage, setQuotaLitisPercentage] = useState(30);
  const [estimatedRetroactive, setEstimatedRetroactive] = useState(42000);
  const [fixedAmount, setFixedAmount] = useState(2400);
  const [installmentsCount, setInstallmentsCount] = useState(6);
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const lawyerName = 'Dr. Alexandre Pontes';
  const lawyerOab = 'OAB/AM 55.858';
  const officeName = 'Alexandre Pontes Sociedade de Advogados';
  const officeOab = 'OAB/AM 12.345';
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const fullAddress = `${client.street}, ${client.streetNumber}, ${client.neighborhood}, ${client.city} - ${client.state}, CEP: ${client.postalCode}`;

  // Generated fee clause
  const generatedFeeClause = useMemo(() => {
    return generateLawyerFeeClause({
      feeModel,
      quotaLitisPercentage,
      estimatedRetroactiveAmount: estimatedRetroactive,
      fixedTotalAmount: fixedAmount,
      installmentCount: installmentsCount,
      firstDueDate,
    });
  }, [feeModel, quotaLitisPercentage, estimatedRetroactive, fixedAmount, installmentsCount, firstDueDate]);

  // Load all templates from store
  const allTemplates = useMemo(() => {
    return contractsStore.getTemplates();
  }, []);

  // Selected fee contract template
  const [selectedFeeTemplateId, setSelectedFeeTemplateId] = useState<string>(() => {
    const matched = allTemplates.find((t) => t.isDefault && t.documentCategory === 'FEE_CONTRACT') || allTemplates[0];
    return matched ? matched.id : 'tpl-001';
  });

  // State to hold live document contents
  const [docContents, setDocContents] = useState<Record<string, string>>({});
  const [kitSelections, setKitSelections] = useState<Record<string, boolean>>({
    contrato: true,
    procuracao: true,
    hipossuficiencia: true,
    capa: true,
  });

  // Currently focused document in Model 1
  const [focusedDocId, setFocusedDocId] = useState<string>('contrato');

  // Currently focused documents in Model 2 (Left & Right)
  const [splitDocLeft, setSplitDocLeft] = useState<string>('contrato');
  const [splitDocRight, setSplitDocRight] = useState<string>('procuracao');

  // Editing state for active sheet
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build the complete list of documents linked to this case/minuta
  const availableDocuments = useMemo<GeneratedDocItem[]>(() => {
    const list: GeneratedDocItem[] = [];

    // 1. Contrato de Honorários (Selected Template)
    const feeTpl = allTemplates.find((t) => t.id === selectedFeeTemplateId) || allTemplates[0];
    const contractBody = feeTpl ? mergeTemplatePlaceholders(feeTpl.contentBody, {
      clientName: client.fullName,
      clientCpf: maskCpf(client.cpf),
      clientRg: client.rg || 'Não informado',
      clientMaritalStatus: 'Casado(a)',
      clientProfession: client.profession || 'Lavradora / Segurada Especial',
      clientAddress: fullAddress,
      clientPhone: maskPhone(client.phone || ''),
      benefitSpecies: client.benefitType || feeTpl.benefitSpecies,
      feeDescription: generatedFeeClause,
      lawyerName,
      lawyerOab,
      officeName,
      officeOab,
      cabinetFolder: cabinetLocation,
      fullDate: todayFormatted,
    }) : '';

    list.push({
      id: 'contrato',
      templateId: feeTpl?.id,
      category: 'FEE_CONTRACT',
      categoryLabel: 'Contrato de Honorários',
      title: feeTpl?.title || 'Contrato de Prestação de Serviços Advocatícios',
      description: 'Instrumento contratual principal com cláusula de honorários e destacamento de RPV/Precatório.',
      content: docContents['contrato'] ?? contractBody,
      isIncludedInKit: kitSelections['contrato'] ?? true,
      isEdited: Boolean(docContents['contrato']),
    });

    // 2. Procuração Ad Judicia et Extra (tpl-005 ou padrão)
    const poaTpl = allTemplates.find((t) => t.documentCategory === 'POWER_OF_ATTORNEY') || allTemplates.find((t) => t.id === 'tpl-005');
    const poaBody = poaTpl ? mergeTemplatePlaceholders(poaTpl.contentBody, {
      clientName: client.fullName,
      clientCpf: maskCpf(client.cpf),
      clientRg: client.rg || 'Não informado',
      clientMaritalStatus: 'Casado(a)',
      clientProfession: client.profession || 'Lavradora / Segurada Especial',
      clientAddress: fullAddress,
      clientPhone: maskPhone(client.phone || ''),
      benefitSpecies: client.benefitType || 'Aposentadoria por Idade Rural',
      feeDescription: `${quotaLitisPercentage}% sobre os atrasados`,
      lawyerName,
      lawyerOab,
      officeName,
      officeOab,
      cabinetFolder: cabinetLocation,
      fullDate: todayFormatted,
    }) : '';

    list.push({
      id: 'procuracao',
      templateId: poaTpl?.id,
      category: 'POWER_OF_ATTORNEY',
      categoryLabel: 'Procuração Ad Judicia',
      title: poaTpl?.title || 'Procuração Ad Judicia et Extra (Previdenciária)',
      description: 'Poderes amplos para o foro geral e poderes especiais para recebimento de RPV e alvarás perante o INSS e Justiça Federal.',
      content: docContents['procuracao'] ?? poaBody,
      isIncludedInKit: kitSelections['procuracao'] ?? true,
      isEdited: Boolean(docContents['procuracao']),
    });

    // 3. Declaração de Hipossuficiência Econômica (tpl-006 ou padrão)
    const hipoTpl = allTemplates.find((t) => t.documentCategory === 'DECLARATION_HIPO') || allTemplates.find((t) => t.id === 'tpl-006');
    const hipoBody = hipoTpl ? mergeTemplatePlaceholders(hipoTpl.contentBody, {
      clientName: client.fullName,
      clientCpf: maskCpf(client.cpf),
      clientRg: client.rg || 'Não informado',
      clientMaritalStatus: 'Casado(a)',
      clientProfession: client.profession || 'Lavradora / Segurada Especial',
      clientAddress: fullAddress,
      clientPhone: maskPhone(client.phone || ''),
      benefitSpecies: client.benefitType || 'Aposentadoria por Idade Rural',
      lawyerName,
      lawyerOab,
      officeName,
      officeOab,
      cabinetFolder: cabinetLocation,
      fullDate: todayFormatted,
    }) : '';

    list.push({
      id: 'hipossuficiencia',
      templateId: hipoTpl?.id,
      category: 'DECLARATION_HIPO',
      categoryLabel: 'Justiça Gratuita (CPC)',
      title: hipoTpl?.title || 'Declaração de Hipossuficiência Econômica',
      description: 'Requerimento formal de gratuidade de justiça nos termos do art. 98 do CPC e art. 5º, LXXIV da CF/88.',
      content: docContents['hipossuficiencia'] ?? hipoBody,
      isIncludedInKit: kitSelections['hipossuficiencia'] ?? true,
      isEdited: Boolean(docContents['hipossuficiencia']),
    });

    // 4. Any other custom templates created in library
    const otherTemplates = allTemplates.filter(
      (t) =>
        t.id !== feeTpl?.id &&
        t.id !== poaTpl?.id &&
        t.id !== hipoTpl?.id
    );

    otherTemplates.forEach((t) => {
      const mergedBody = mergeTemplatePlaceholders(t.contentBody, {
        clientName: client.fullName,
        clientCpf: maskCpf(client.cpf),
        clientRg: client.rg || 'Não informado',
        clientMaritalStatus: 'Casado(a)',
        clientProfession: client.profession || 'Lavradora / Segurada Especial',
        clientAddress: fullAddress,
        clientPhone: maskPhone(client.phone || ''),
        benefitSpecies: client.benefitType || t.benefitSpecies,
        feeDescription: generatedFeeClause,
        lawyerName,
        lawyerOab,
        officeName,
        officeOab,
        cabinetFolder: cabinetLocation,
        fullDate: todayFormatted,
      });

      list.push({
        id: `tpl-${t.id}`,
        templateId: t.id,
        category: t.documentCategory || 'OTHER',
        categoryLabel: formatDocumentCategory(t.documentCategory, t.customCategoryName),
        title: t.title,
        description: t.description || `Minuta de ${formatDocumentCategory(t.documentCategory, t.customCategoryName)} cadastrada na biblioteca.`,
        content: docContents[`tpl-${t.id}`] ?? mergedBody,
        isIncludedInKit: kitSelections[`tpl-${t.id}`] ?? false,
        isEdited: Boolean(docContents[`tpl-${t.id}`]),
      });
    });

    // 5. Capa de Pasta Física (Etiqueta de Arquivo OAB)
    const folderCoverBody = `ETIQUETA E CAPA DE PRONTUÁRIO JURÍDICO — PREVIOFFICE

ESCRITÓRIO: ${officeName} (${officeOab})
CLIENTE: ${client.fullName}
CPF: ${maskCpf(client.cpf)} | RG: ${client.rg}
BENEFÍCIO REQUERIDO: ${client.benefitType}
ADVOGADO RESPONSÁVEL: ${lawyerName} (${lawyerOab})
DATA DE CADASTRO: ${todayFormatted}

LOCALIZAÇÃO FÍSICA NO ARQUIVO:
${cabinetLocation}

DOCUMENTOS INTEGRANTES DESTE PRONTUÁRIO:
1. Instrumento Particular de Contrato de Honorários Advocatícios
2. Procuração Ad Judicia et Extra com Poderes para Recebimento de RPV
3. Declaração de Hipossuficiência Econômica (Gratuidade Judiciária)
4. Extratos do CNIS e Autodeclaração de Segurado Especial Rural
5. Comprovantes de Residência e Documentos Pessoais Autenticados`;

    list.push({
      id: 'capa',
      category: 'FOLDER_COVER',
      categoryLabel: 'Identificação Física',
      title: 'Capa e Etiqueta de Pasta de Arquivo',
      description: 'Ficha catalográfica padronizada para colagem na pasta física do armário do escritório.',
      content: docContents['capa'] ?? folderCoverBody,
      isIncludedInKit: kitSelections['capa'] ?? true,
      isEdited: Boolean(docContents['capa']),
    });

    return list;
  }, [
    allTemplates,
    selectedFeeTemplateId,
    client,
    fullAddress,
    cabinetLocation,
    todayFormatted,
    generatedFeeClause,
    docContents,
    kitSelections,
    quotaLitisPercentage,
  ]);

  // Current active document object
  const currentDoc = useMemo(() => {
    return availableDocuments.find((d) => d.id === focusedDocId) || availableDocuments[0];
  }, [availableDocuments, focusedDocId]);

  const leftDoc = useMemo(() => {
    return availableDocuments.find((d) => d.id === splitDocLeft) || availableDocuments[0];
  }, [availableDocuments, splitDocLeft]);

  const rightDoc = useMemo(() => {
    return availableDocuments.find((d) => d.id === splitDocRight) || availableDocuments[1] || availableDocuments[0];
  }, [availableDocuments, splitDocRight]);

  const toggleKitItem = (docId: string) => {
    setKitSelections((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleUpdateContent = (docId: string, newContent: string) => {
    setDocContents((prev) => ({
      ...prev,
      [docId]: newContent,
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerToast('Texto do documento copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedKitCount = useMemo(() => {
    return availableDocuments.filter((d) => d.isIncludedInKit).length;
  }, [availableDocuments]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation & Prototype Controls */}
      <header className="bg-[#081322] border-b border-white/10 px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/contracts"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Voltar para Contratos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C89543] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Ambiente Interativo de Homologação — Novos Modelos de Emissão</span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white">
              Emissão de Procuração, Contrato e Documentos da Minuta
            </h1>
          </div>
        </div>

        {/* Switcher between Model 1 and Model 2 */}
        <div className="flex items-center bg-slate-900 border border-slate-700 p-1 rounded-xl shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setActiveModel('model1')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModel === 'model1'
                ? 'bg-[#C89543] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Modelo 1: Painel Lateral & Kit Completo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModel('model2')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModel === 'model2'
                ? 'bg-[#0B78D0] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Modelo 2: Duplo Lado a Lado (Split View)</span>
          </button>
        </div>
      </header>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-700 text-white rounded-xl shadow-xl border border-emerald-500 animate-in slide-in-from-top duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: PARÂMETROS DA MINUTA & HONORÁRIOS (COMUM AOS 2 MODELOS)  */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-80 lg:w-88 shrink-0 bg-[#0B192E] border-r border-white/10 flex flex-col h-full overflow-hidden">
          {/* Header do Cliente */}
          <div className="p-4 border-b border-white/10 bg-slate-900/60 shrink-0">
            <span className="text-[10px] font-bold text-[#C89543] uppercase tracking-wider block mb-1">
              Cliente em Atendimento
            </span>
            <h2 className="text-sm font-bold text-white leading-tight">{client.fullName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              CPF: {maskCpf(client.cpf)} • {client.benefitType}
            </p>
            <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{cabinetLocation}</span>
            </div>
          </div>

          {/* Configuração de Minutas e Honorários */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Escolha do Contrato Base */}
            <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-white/10">
              <label className="block text-[10px] font-bold uppercase text-[#C89543] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Minuta Contratual Base</span>
              </label>
              <select
                value={selectedFeeTemplateId}
                onChange={(e) => setSelectedFeeTemplateId(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
              >
                {allTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.isDefault ? '★ [Padrão] ' : ''}
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Regime de Honorários */}
            <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase text-slate-300 block">
                Regime de Remuneração
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeeModel('QUOTA_LITIS')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    feeModel === 'QUOTA_LITIS'
                      ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs">Quota Litis</div>
                  <div className="text-[10px] opacity-75">Êxito sobre atrasados</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFeeModel('FIXED_INSTALLMENT')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    feeModel === 'FIXED_INSTALLMENT'
                      ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs">Parcelamento</div>
                  <div className="text-[10px] opacity-75">Mensalidades / carnê</div>
                </button>
              </div>

              {feeModel === 'QUOTA_LITIS' ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Percentual Êxito:</span>
                    <span className="font-bold text-[#C89543] text-sm">{quotaLitisPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={quotaLitisPercentage}
                    onChange={(e) => setQuotaLitisPercentage(Number(e.target.value))}
                    className="w-full accent-[#C89543]"
                  />
                  <div className="text-[11px] text-slate-400 bg-slate-800/80 p-2 rounded">
                    Retroativo Estimado: R$ {estimatedRetroactive.toLocaleString('pt-BR')},00 <br />
                    Honorário Projetado:{' '}
                    <strong className="text-emerald-400">
                      R$ {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR')},00
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Valor Total:</span>
                      <input
                        type="number"
                        step={100}
                        value={fixedAmount}
                        onChange={(e) => setFixedAmount(Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Parcelas:</span>
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
                </div>
              )}
            </div>

            {/* Resumo do Kit Marcado */}
            <div className="bg-emerald-950/40 border border-emerald-600/30 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                <span>Kit de Emissão</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {selectedKitCount} docs marcados
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Os documentos marcados serão gerados, assinados digitalmente e impressos em conjunto.
              </p>
            </div>
          </div>

          {/* Rodapé da Barra Lateral */}
          <div className="p-3 bg-slate-900 border-t border-white/10 shrink-0 space-y-2">
            <button
              type="button"
              onClick={() => triggerToast(`Formalização concluída! ${selectedKitCount} documentos foram emitidos para ${client.fullName}.`)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#168447] hover:bg-[#126b39] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Formalizar Kit Completo ({selectedKitCount})</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast(`Disparando impressão do lote com ${selectedKitCount} documentos A4...`)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#082A52] hover:bg-[#0c396d] text-white text-xs font-bold border border-[#C89543]/40 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-[#C89543]" />
              <span>Imprimir Documentos Selecionados</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* ÁREA CENTRAL: ALTERNÂNCIA ENTRE MODELO 1 E MODELO 2                       */}
        {/* ========================================================================= */}
        {activeModel === 'model1' ? (
          /* MODELO 1: PAINEL LATERAL COM TODOS OS DOCUMENTOS DA MINUTA + FOLHA A4 EM FOCO */
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-slate-200">
            {/* Lista dos Documentos da Minuta ao lado da Folha */}
            <div className="w-full lg:w-96 shrink-0 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Layers className="w-4 h-4 text-[#C89543]" />
                  <span>Documentos Vinculados à Minuta</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                  {availableDocuments.length} disponíveis
                </span>
              </div>

              {/* Lista Vertical com Cartões de cada documento */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
                {availableDocuments.map((doc, idx) => {
                  const isActive = doc.id === focusedDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setFocusedDocId(doc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-[#082A52] border-[#C89543] shadow-md ring-2 ring-[#C89543]/30'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={doc.isIncludedInKit}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleKitItem(doc.id);
                            }}
                            className="w-4 h-4 accent-[#C89543] rounded cursor-pointer"
                            title="Marcar para incluir no Kit de emissão e impressão"
                          />
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#C89543]">
                            {idx + 1}. {doc.categoryLabel}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Em Foco</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {doc.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          {doc.isIncludedInKit ? '✓ No kit de emissão' : '○ Não incluído'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusedDocId(doc.id);
                            setIsEditing(!isEditing);
                          }}
                          className="text-[#C89543] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar texto</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Folha A4 Central em Foco */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-300/80">
              {/* Barra de Ações Rápidas da Folha */}
              <div className="bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#082A52] text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#C89543]" />
                    <span>Visualizando: {currentDoc.title}</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    {currentDoc.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Concluir Edição' : 'Editar Cláusulas'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentDoc.content)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerToast(`Enviando "${currentDoc.title}" para a impressora...`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#082A52] text-white hover:bg-[#0c396d] cursor-pointer shadow-xs transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>Imprimir Esta Folha</span>
                  </button>
                </div>
              </div>

              {/* Folha A4 Renderizada */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 flex justify-center items-start">
                <div className="bg-white w-full max-w-[800px] min-h-[1130px] shadow-2xl rounded-xs border border-slate-300 p-10 sm:p-14 text-slate-900 text-xs sm:text-sm leading-relaxed flex flex-col justify-between shrink-0 mb-12">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900">
                        <span className="font-bold">Modo de Edição Livre Ativo</span>
                        <span>As alterações serão salvas neste documento</span>
                      </div>
                      <textarea
                        value={currentDoc.content}
                        onChange={(e) => handleUpdateContent(currentDoc.id, e.target.value)}
                        className="w-full h-[900px] p-4 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B78D0]"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Cabeçalho da Folha */}
                      <div>
                        <div className="text-center border-b border-slate-300 pb-4 mb-6">
                          <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-900">
                            {officeName}
                          </h3>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Sociedade de Advogados inscrita sob a {officeOab} • Advocacia Previdenciária Especializada
                          </p>
                        </div>

                        {/* Corpo do Documento */}
                        <div className="whitespace-pre-line text-justify leading-relaxed font-serif text-[12px] sm:text-[13px] text-slate-800 space-y-4">
                          {currentDoc.content}
                        </div>
                      </div>

                      {/* Rodapé e Assinaturas */}
                      <div className="pt-12 mt-8 border-t border-slate-200 space-y-8">
                        <div className="grid grid-cols-2 gap-8 text-center text-xs">
                          <div>
                            <div className="border-b border-slate-400 w-3/4 mx-auto mb-1.5" />
                            <strong className="block text-slate-900">{client.fullName}</strong>
                            <span className="text-slate-600 text-[11px]">CONTRATANTE / OUTORGANTE</span>
                          </div>
                          <div>
                            <div className="border-b border-slate-400 w-3/4 mx-auto mb-1.5" />
                            <strong className="block text-slate-900">{lawyerName}</strong>
                            <span className="text-slate-600 text-[11px]">{lawyerOab} • ADVOGADO(A)</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>Prontuário OAB: {client.id.substring(0, 8)}</span>
                          <span>Pasta Física: {cabinetLocation}</span>
                          <span>Emissão Digital PreviOffice • Página 1 de 1</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODELO 2: VISUALIZAÇÃO DUPLA LADO A LADO (SPLIT VIEW PARA CONFERÊNCIA SIMULTÂNEA) */
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-300">
            {/* Top Toolbar de Seleção dos 2 Documentos */}
            <div className="bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-[#0B78D0]" />
                <span className="font-extrabold text-[#082A52] text-sm">
                  Modo Comparativo / Conferência Simultânea em Tela Dupla
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => triggerToast('Imprimindo os 2 documentos selecionados lado a lado...')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#082A52] text-white rounded-lg font-bold hover:bg-[#0c396d] transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Imprimir Ambos Lado a Lado</span>
                </button>
              </div>
            </div>

            {/* Split View com 2 Colunas de Folhas A4 */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-400 overflow-hidden">
              {/* COLUNA ESQUERDA: DOCUMENTO 1 */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-200/80">
                <div className="bg-slate-100 border-b border-slate-300 p-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Documento 1:</span>
                    <select
                      value={splitDocLeft}
                      onChange={(e) => setSplitDocLeft(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-[#082A52]"
                    >
                      {availableDocuments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.categoryLabel}: {d.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(leftDoc.content)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
                  <div className="bg-white w-full max-w-[620px] min-h-[950px] shadow-xl rounded-xs border border-slate-300 p-6 sm:p-8 text-slate-900 text-xs leading-relaxed flex flex-col justify-between shrink-0 mb-8">
                    <div>
                      <div className="text-center border-b border-slate-200 pb-3 mb-4">
                        <strong className="text-xs uppercase block text-slate-800">{officeName}</strong>
                        <span className="text-[10px] text-slate-500">{leftDoc.title}</span>
                      </div>
                      <div className="whitespace-pre-line text-justify leading-relaxed font-serif text-[11px] text-slate-800">
                        {leftDoc.content}
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
                      <span>{client.fullName} • {lawyerName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA: DOCUMENTO 2 */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-200/80">
                <div className="bg-slate-100 border-b border-slate-300 p-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Documento 2:</span>
                    <select
                      value={splitDocRight}
                      onChange={(e) => setSplitDocRight(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-[#082A52]"
                    >
                      {availableDocuments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.categoryLabel}: {d.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(rightDoc.content)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
                  <div className="bg-white w-full max-w-[620px] min-h-[950px] shadow-xl rounded-xs border border-slate-300 p-6 sm:p-8 text-slate-900 text-xs leading-relaxed flex flex-col justify-between shrink-0 mb-8">
                    <div>
                      <div className="text-center border-b border-slate-200 pb-3 mb-4">
                        <strong className="text-xs uppercase block text-slate-800">{officeName}</strong>
                        <span className="text-[10px] text-slate-500">{rightDoc.title}</span>
                      </div>
                      <div className="whitespace-pre-line text-justify leading-relaxed font-serif text-[11px] text-slate-800">
                        {rightDoc.content}
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
                      <span>{client.fullName} • {lawyerName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
