'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { Client } from '@/types/client';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import { settingsStore } from '@/lib/data/mock-settings';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { createClient } from '@/lib/supabase/client';
import {
  mergeTemplatePlaceholders,
  generateLawyerFeeClause,
  generateFeeInstallments,
} from '@/lib/utils/template-engine';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import { formatBenefitType, formatDocumentCategory } from '@/lib/utils/benefit-translations';
import { escapeHtml } from '@/lib/security/xss';
import {
  printSingleContract,
  printBatchContracts,
} from './contract-modal/contract-printer';
import { ContractParametersSidebar } from './contract-modal/contract-parameters-sidebar';
import { ContractDocumentList } from './contract-modal/contract-document-list';
import { ContractPreviewSheet } from './contract-modal/contract-preview-sheet';

export interface GeneratedDocItem {
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

export interface LegalContractModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onContractIssued?: (contractNumber: string) => void;
}

export function LegalContractModal({
  client,
  isOpen,
  onClose,
  onContractIssued,
}: LegalContractModalProps) {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const cd = t.clientDetails;

  // Função 1: Ocultar/mostrar painéis laterais (Modo Leitura 100%)
  const [isSidebarsHidden, setIsSidebarsHidden] = useState(false);

  // Advogados disponíveis
  const lawyerOptions = useMemo(() => {
    const list = [];
    if (currentUser?.fullName) {
      list.push({ name: currentUser.fullName, oab: currentUser.oabNumber || 'OAB/AM' });
    }
    const team = settingsStore.getTeamMembers().filter((m) => m.memberType === 'LAWYER');
    for (const member of team) {
      if (!list.some((l) => l.name === member.fullName)) {
        list.push({ name: member.fullName, oab: member.oabNumber || 'OAB/AM' });
      }
    }
    if (list.length === 0) {
      list.push({ name: 'Advogado Titular', oab: 'OAB/AM' });
    }
    return list;
  }, [currentUser]);

  const [selectedLawyer, setSelectedLawyer] = useState(lawyerOptions[0]);
  const officeSettings = settingsStore.getOfficeSettings();
  const officeName = officeSettings?.officeName || 'Sociedade de Advogados';
  const officeOab = officeSettings?.oabSocietyNumber || 'OAB/AM';
  const cabinetLocation = client.physicalFileLocation || 'Armário B - Gaveta 03 - Pasta 2026-042';

  // Carrega minutas
  const allTemplates = useMemo(() => {
    return contractsStore.getTemplates();
  }, []);

  // Seleção da minuta base
  const [selectedFeeTemplateId, setSelectedFeeTemplateId] = useState<string>(() => {
    const matched = allTemplates.find((t) => t.isDefault && t.documentCategory === 'FEE_CONTRACT') || allTemplates[0];
    return matched ? matched.id : 'tpl-001';
  });

  // Função 2: Regime de Remuneração (Quota Litis, Parcelado, Híbrido) + Vencimentos
  const [feeModel, setFeeModel] = useState<FeeModel>('QUOTA_LITIS');
  const [quotaLitisPercentage, setQuotaLitisPercentage] = useState(30);
  const [estimatedRetroactive, setEstimatedRetroactive] = useState(42000);
  const [fixedAmount, setFixedAmount] = useState(2400);
  const [installmentsCount, setInstallmentsCount] = useState(6);
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [recurringDueDay, setRecurringDueDay] = useState<number>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.getDate();
  });

  // Helpers de formatação de datas dos vencimentos
  const formattedFirstDueDate = useMemo(() => {
    if (!firstDueDate) return '';
    const parts = firstDueDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return firstDueDate;
  }, [firstDueDate]);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const fullAddress = useMemo(() => {
    const parts = [
      client.street,
      client.streetNumber,
      client.complement,
      client.neighborhood,
      client.city ? `${client.city} - ${client.state || ''}` : '',
      client.postalCode ? `CEP: ${client.postalCode}` : '',
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Endereço residencial não informado';
  }, [client]);

  // Cláusula gerada dinamicamente com as datas reais de cada parcela
  const generatedFeeClause = useMemo(() => {
    return generateLawyerFeeClause({
      feeModel,
      quotaLitisPercentage,
      estimatedRetroactiveAmount: estimatedRetroactive,
      fixedTotalAmount: fixedAmount,
      installmentCount: installmentsCount,
      firstDueDate,
      recurringDueDay,
    });
  }, [feeModel, quotaLitisPercentage, estimatedRetroactive, fixedAmount, installmentsCount, firstDueDate, recurringDueDay]);

  // Conteúdos ao vivo e seleções de documentos do Kit
  const [docContents, setDocContents] = useState<Record<string, string>>({});
  const [kitSelections, setKitSelections] = useState<Record<string, boolean>>({
    contrato: true,
    procuracao: true,
    hipossuficiencia: true,
    capa: true,
  });

  // Documento em foco na Folha A4
  const [focusedDocId, setFocusedDocId] = useState<string>('contrato');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Monta a lista completa de documentos vinculados à minuta
  const availableDocuments = useMemo<GeneratedDocItem[]>(() => {
    const list: GeneratedDocItem[] = [];

    // 1. Contrato de Honorários
    const feeTpl = allTemplates.find((t) => t.id === selectedFeeTemplateId) || allTemplates[0];
    const contractBody = feeTpl
      ? mergeTemplatePlaceholders(feeTpl.contentBody, {
          clientName: client.fullName,
          clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
          clientRg: client.rg || 'Não informado',
          clientMaritalStatus: 'Casado(a)',
          clientProfession: client.profession || 'Agricultora / Segurada Especial Rural',
          clientAddress: fullAddress,
          clientPhone: client.phone || client.mobilePhone ? maskPhone(client.phone || client.mobilePhone || '') : 'Não informado',
          benefitSpecies: formatBenefitType(client.benefitType, 'pt-BR') || feeTpl.benefitSpecies,
          feeDescription: generatedFeeClause,
          lawyerName: selectedLawyer.name,
          lawyerOab: selectedLawyer.oab,
          officeName,
          officeOab,
          cabinetFolder: cabinetLocation,
          fullDate: todayFormatted,
        })
      : '';

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

    // 2. Procuração Ad Judicia
    const poaTpl = allTemplates.find((t) => t.documentCategory === 'POWER_OF_ATTORNEY') || allTemplates.find((t) => t.id === 'tpl-005');
    const poaBody = poaTpl
      ? mergeTemplatePlaceholders(poaTpl.contentBody, {
          clientName: client.fullName,
          clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
          clientRg: client.rg || 'Não informado',
          clientMaritalStatus: 'Casado(a)',
          clientProfession: client.profession || 'Agricultora / Segurada Especial Rural',
          clientAddress: fullAddress,
          clientPhone: client.phone || client.mobilePhone ? maskPhone(client.phone || client.mobilePhone || '') : 'Não informado',
          benefitSpecies: formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Previdenciária',
          feeDescription: `${quotaLitisPercentage}% sobre os atrasados`,
          lawyerName: selectedLawyer.name,
          lawyerOab: selectedLawyer.oab,
          officeName,
          officeOab,
          cabinetFolder: cabinetLocation,
          fullDate: todayFormatted,
        })
      : '';

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

    // 3. Justiça Gratuita (CPC)
    const hipoTpl = allTemplates.find((t) => t.documentCategory === 'DECLARATION_HIPO') || allTemplates.find((t) => t.id === 'tpl-006');
    const hipoBody = hipoTpl
      ? mergeTemplatePlaceholders(hipoTpl.contentBody, {
          clientName: client.fullName,
          clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
          clientRg: client.rg || 'Não informado',
          clientMaritalStatus: 'Casado(a)',
          clientProfession: client.profession || 'Agricultora / Segurada Especial Rural',
          clientAddress: fullAddress,
          clientPhone: client.phone || client.mobilePhone ? maskPhone(client.phone || client.mobilePhone || '') : 'Não informado',
          benefitSpecies: formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Previdenciária',
          lawyerName: selectedLawyer.name,
          lawyerOab: selectedLawyer.oab,
          officeName,
          officeOab,
          cabinetFolder: cabinetLocation,
          fullDate: todayFormatted,
        })
      : '';

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

    // 4. Outras minutas da biblioteca
    const otherTemplates = allTemplates.filter(
      (t) => t.id !== feeTpl?.id && t.id !== poaTpl?.id && t.id !== hipoTpl?.id
    );

    otherTemplates.forEach((t) => {
      const mergedBody = mergeTemplatePlaceholders(t.contentBody, {
        clientName: client.fullName,
        clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
        clientRg: client.rg || 'Não informado',
        clientMaritalStatus: 'Casado(a)',
        clientProfession: client.profession || 'Agricultora / Segurada Especial Rural',
        clientAddress: fullAddress,
        clientPhone: client.phone || client.mobilePhone ? maskPhone(client.phone || client.mobilePhone || '') : 'Não informado',
        benefitSpecies: formatBenefitType(client.benefitType, 'pt-BR') || t.benefitSpecies,
        feeDescription: generatedFeeClause,
        lawyerName: selectedLawyer.name,
        lawyerOab: selectedLawyer.oab,
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

    // 5. Capa e Etiqueta de Pasta
    const folderCoverBody = `ETIQUETA E CAPA DE PRONTUÁRIO JURÍDICO — PREVIOFFICE

ESCRITÓRIO: ${officeName} (${officeOab})
CLIENTE: ${client.fullName}
CPF: ${client.cpf ? maskCpf(client.cpf) : 'Não informado'} | RG: ${client.rg || 'Não informado'}
BENEFÍCIO REQUERIDO: ${formatBenefitType(client.benefitType, 'pt-BR') || 'Previdenciário'}
ADVOGADO RESPONSÁVEL: ${selectedLawyer.name} (${selectedLawyer.oab})
DATA DE CADASTRO: ${todayFormatted}

LOCALIZAÇÃO FÍSICA NO ARQUIVO:
${cabinetLocation}

DOCUMENTOS INTEGRANTES DESTE PRONTUÁRIO:
1. Instrumento Particular de Contrato de Honorários Advocatícios
2. Procuração Ad Judicia et Extra com Poderes para Recebimento de RPV
3. Declaração de Hipossuficiência Econômica (Gratuidade Judiciária)
4. Extratos do CNIS e Documentos Pessoais Autenticados`;

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
    selectedLawyer,
  ]);

  // Documento em foco
  const currentDoc = useMemo(() => {
    return availableDocuments.find((d) => d.id === focusedDocId) || availableDocuments[0];
  }, [availableDocuments, focusedDocId]);

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

  // Imprimir folha atual
  const handlePrintSingle = () => {
    printSingleContract(currentDoc, {
      officeName,
      officeOab,
      clientFullName: client.fullName,
      lawyerName: selectedLawyer.name,
      lawyerOab: selectedLawyer.oab,
    });
  };

  // Imprimir todo o kit selecionado
  const handlePrintBatch = () => {
    const selectedDocs = availableDocuments.filter((d) => d.isIncludedInKit);
    if (selectedDocs.length === 0) {
      triggerToast('Nenhum documento selecionado para impressão.');
      return;
    }
    printBatchContracts(selectedDocs, {
      officeName,
      officeOab,
      clientFullName: client.fullName,
      lawyerName: selectedLawyer.name,
      lawyerOab: selectedLawyer.oab,
    });
  };

  // Formalizar e Salvar
  const handleFormalize = async () => {
    setIsSaving(true);
    const contractNumber = `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const feeTpl = allTemplates.find((t) => t.id === selectedFeeTemplateId) || allTemplates[0];

    try {
      contractsStore.createContract({
        tenantId: currentUser?.tenantId || '',
        clientId: client.id,
        clientName: client.fullName,
        clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
        clientPhone: client.phone || client.mobilePhone ? maskPhone(client.phone || client.mobilePhone || '') : undefined,
        contractNumber,
        templateId: feeTpl?.id,
        templateTitle: feeTpl?.title,
        benefitSpecies: formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Previdenciária',
        status: 'ACTIVE',
        feeStructure: {
          feeModel,
          quotaLitisPercentage: feeModel !== 'FIXED_INSTALLMENT' ? quotaLitisPercentage : undefined,
          estimatedRetroactiveAmount: feeModel !== 'FIXED_INSTALLMENT' ? estimatedRetroactive : undefined,
          estimatedSuccessFeeAmount: feeModel !== 'FIXED_INSTALLMENT' ? (estimatedRetroactive * quotaLitisPercentage) / 100 : undefined,
          fixedTotalAmount: feeModel !== 'QUOTA_LITIS' ? fixedAmount : undefined,
          installmentCount: feeModel !== 'QUOTA_LITIS' ? installmentsCount : 0,
          installments: feeModel !== 'QUOTA_LITIS' ? generateFeeInstallments(fixedAmount, installmentsCount, firstDueDate, contractNumber, recurringDueDay) : [],
        },
        physicalSignedStatus: 'PENDING',
        lawyerName: selectedLawyer.name,
        lawyerOab: selectedLawyer.oab,
        officeName,
        issuedAt: new Date().toISOString(),
        physicalFileLocation: cabinetLocation,
        customContractBody: docContents['contrato'],
        customPoaBody: docContents['procuracao'],
      });

      // Persistência no Supabase
      const supabase = createClient();
      await (supabase.from('contracts') as any).insert({
        tenant_id: currentUser?.tenantId || '',
        client_id: client.id,
        contract_number: contractNumber,
        template_id: feeTpl?.id,
        template_title: feeTpl?.title,
        benefit_species: formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Previdenciária',
        status: 'ACTIVE',
        lawyer_name: selectedLawyer.name,
        lawyer_oab: selectedLawyer.oab,
        physical_signed_status: 'PENDING',
        physical_file_location: cabinetLocation,
        issued_at: new Date().toISOString(),
      });

      triggerToast(`Formalização concluída! Contrato nº ${contractNumber} emitido.`);
      if (onContractIssued) {
        onContractIssued(contractNumber);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Contrato formalizado no sistema local com sucesso!');
      if (onContractIssued) {
        onContractIssued(contractNumber);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Fechar no Esc
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[98vw] 2xl:max-w-7xl h-[96vh] max-h-[96vh] bg-[#081322] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header do Modal */}
        <header className="bg-[#081322] border-b border-white/10 px-4 py-3 shrink-0 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#C89543]/20 border border-[#C89543]/30 text-[#C89543]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold text-[#C89543] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{cd.contractModalBadge}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-white">
                {client.fullName} • CPF: {client.cpf ? maskCpf(client.cpf) : 'Não informado'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Função 1: Botão Ocultar / Mostrar Painéis Laterais */}
            <button
              type="button"
              onClick={() => setIsSidebarsHidden(!isSidebarsHidden)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer shadow-xs"
              title={isSidebarsHidden ? cd.showSidebars : cd.hideSidebars}
            >
              {isSidebarsHidden ? (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>{cd.showSidebars}</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>{cd.hideSidebars}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Feedback de Toast */}
        {toastMessage && (
          <div className="fixed top-16 right-8 z-60 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-700 text-white rounded-xl shadow-xl border border-emerald-500 animate-in slide-in-from-top duration-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* WORKSPACE CENTRAL DIVIDIDO EM 3 COLUNAS */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-slate-200">
          {!isSidebarsHidden && (
            <ContractParametersSidebar
              t={t}
              client={client}
              cabinetLocation={cabinetLocation}
              lawyerOptions={lawyerOptions}
              selectedLawyer={selectedLawyer}
              setSelectedLawyer={setSelectedLawyer}
              allTemplates={allTemplates}
              selectedFeeTemplateId={selectedFeeTemplateId}
              setSelectedFeeTemplateId={setSelectedFeeTemplateId}
              feeModel={feeModel}
              setFeeModel={setFeeModel}
              quotaLitisPercentage={quotaLitisPercentage}
              setQuotaLitisPercentage={setQuotaLitisPercentage}
              estimatedRetroactive={estimatedRetroactive}
              fixedAmount={fixedAmount}
              setFixedAmount={setFixedAmount}
              installmentsCount={installmentsCount}
              setInstallmentsCount={setInstallmentsCount}
              firstDueDate={firstDueDate}
              setFirstDueDate={setFirstDueDate}
              recurringDueDay={recurringDueDay}
              setRecurringDueDay={setRecurringDueDay}
              formattedFirstDueDate={formattedFirstDueDate}
              selectedKitCount={selectedKitCount}
              isSaving={isSaving}
              onFormalize={handleFormalize}
              onPrintBatch={handlePrintBatch}
            />
          )}

          {!isSidebarsHidden && (
            <ContractDocumentList
              t={t}
              availableDocuments={availableDocuments}
              focusedDocId={focusedDocId}
              setFocusedDocId={setFocusedDocId}
              onToggleKitItem={toggleKitItem}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          )}

          <ContractPreviewSheet
            t={t}
            currentDoc={currentDoc}
            isSidebarsHidden={isSidebarsHidden}
            onRestoreSidebars={() => setIsSidebarsHidden(false)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCopy={handleCopy}
            copied={copied}
            onPrintSingle={handlePrintSingle}
            onUpdateContent={handleUpdateContent}
            officeName={officeName}
            officeOab={officeOab}
            clientFullName={client.fullName}
            clientId={client.id}
            selectedLawyer={selectedLawyer}
            cabinetLocation={cabinetLocation}
          />
        </div>
      </div>
    </div>
  );
}

export default LegalContractModal;
