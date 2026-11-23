'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FileText,
  FolderLock,
  CheckCircle2,
  Printer,
  Edit3,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  Layers,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
} from 'lucide-react';
import type { Client } from '@/types/client';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  mergeTemplatePlaceholders,
  generateLawyerFeeClause,
  generateFeeInstallments,
} from '@/lib/utils/template-engine';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import { formatBenefitType, formatDocumentCategory } from '@/lib/utils/benefit-translations';

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

  // Função 1: Ocultar/mostrar painéis laterais (Modo Leitura 100%)
  const [isSidebarsHidden, setIsSidebarsHidden] = useState(false);

  // Advogados disponíveis
  const lawyerOptions = useMemo(() => {
    const list = [];
    if (currentUser?.fullName) {
      list.push({ name: currentUser.fullName, oab: currentUser.oabNumber || 'OAB/AM 55.858' });
    }
    list.push({ name: 'Dr. Alexandre Pontes', oab: 'OAB/AM 55.858' });
    return list;
  }, [currentUser]);

  const [selectedLawyer, setSelectedLawyer] = useState(lawyerOptions[0]);
  const officeName = 'Alexandre Pontes Sociedade de Advogados';
  const officeOab = 'OAB/AM 12.345';
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
    const printableArea = document.getElementById('demo-a4-printable-area');
    if (!printableArea) {
      window.print();
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${currentDoc.title} - ${client.fullName}</title>
            <style>
              @page { size: A4; margin: 20mm 15mm; }
              body { font-family: serif; font-size: 13px; line-height: 1.6; color: #111; margin: 0; padding: 0; }
              .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 20px; }
              .header h3 { font-size: 15px; margin: 0; text-transform: uppercase; font-weight: bold; }
              .header p { font-size: 11px; margin: 4px 0 0 0; color: #555; }
              .content { white-space: pre-line; text-align: justify; }
              .signatures { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
              .sig-line { width: 220px; border-top: 1px solid #333; margin: 0 auto 6px auto; padding-top: 4px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>${officeName}</h3>
              <p>Sociedade de Advogados inscrita sob a ${officeOab} • Advocacia Previdenciária</p>
            </div>
            <div class="content">${currentDoc.content}</div>
            <div class="signatures">
              <div>
                <div class="sig-line"></div>
                <strong>${client.fullName}</strong><br/>
                <span>OUTORGANTE / CONTRATANTE</span>
              </div>
              <div>
                <div class="sig-line"></div>
                <strong>${selectedLawyer.name}</strong><br/>
                <span>${selectedLawyer.oab} • ADVOGADO(A)</span>
              </div>
            </div>
          </body>
        </html>
      `);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    }
  };

  // Imprimir todo o kit selecionado
  const handlePrintBatch = () => {
    const selectedDocs = availableDocuments.filter((d) => d.isIncludedInKit);
    if (selectedDocs.length === 0) {
      triggerToast('Nenhum documento selecionado para impressão.');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      const pagesHtml = selectedDocs
        .map(
          (d, idx) => `
          <div style="${idx < selectedDocs.length - 1 ? 'page-break-after: always;' : ''} padding: 10px;">
            <div class="header">
              <h3>${officeName}</h3>
              <p>Sociedade de Advogados inscrita sob a ${officeOab} • Advocacia Previdenciária</p>
            </div>
            <div class="content">${d.content}</div>
            <div class="signatures">
              <div>
                <div class="sig-line"></div>
                <strong>${client.fullName}</strong><br/>
                <span>OUTORGANTE / CONTRATANTE</span>
              </div>
              <div>
                <div class="sig-line"></div>
                <strong>${selectedLawyer.name}</strong><br/>
                <span>${selectedLawyer.oab} • ADVOGADO(A)</span>
              </div>
            </div>
          </div>
        `
        )
        .join('');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Kit de Emissão - ${client.fullName}</title>
            <style>
              @page { size: A4; margin: 20mm 15mm; }
              body { font-family: serif; font-size: 13px; line-height: 1.6; color: #111; margin: 0; padding: 0; }
              .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 20px; }
              .header h3 { font-size: 15px; margin: 0; text-transform: uppercase; font-weight: bold; }
              .header p { font-size: 11px; margin: 4px 0 0 0; color: #555; }
              .content { white-space: pre-line; text-align: justify; }
              .signatures { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
              .sig-line { width: 220px; border-top: 1px solid #333; margin: 0 auto 6px auto; padding-top: 4px; }
            </style>
          </head>
          <body>
            ${pagesHtml}
          </body>
        </html>
      `);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 400);
    }
  };

  // Formalizar e Salvar
  const handleFormalize = async () => {
    setIsSaving(true);
    const contractNumber = `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const feeTpl = allTemplates.find((t) => t.id === selectedFeeTemplateId) || allTemplates[0];

    try {
      contractsStore.createContract({
        tenantId: currentUser?.tenantId || 'tenant-001',
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
        tenant_id: currentUser?.tenantId || 'tenant-001',
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
                <span>Emissão Oficial de Procuração, Contrato e Documentos OAB</span>
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
              title={isSidebarsHidden ? 'Mostrar Painéis Laterais (Parâmetros e Documentos)' : 'Ocultar Painéis para Modo Leitura 100%'}
            >
              {isSidebarsHidden ? (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Mostrar Painéis</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Ocultar Painéis</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar"
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

        {/* ========================================================================= */}
        {/* WORKSPACE CENTRAL DIVIDIDO EM 3 COLUNAS (IDÊNTICO AO DEMO-DOCUMENTOS)    */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-slate-200">
          {/* ========================================================================= */}
          {/* COLUNA 1 (ESQUERDA): PARÂMETROS DA MINUTA & HONORÁRIOS                   */}
          {/* ========================================================================= */}
          {!isSidebarsHidden && (
            <aside className="w-full md:w-80 lg:w-88 shrink-0 bg-[#0B192E] border-r border-white/10 flex flex-col h-full overflow-hidden text-white transition-all duration-200">
              {/* Header do Cliente */}
              <div className="p-4 border-b border-white/10 bg-slate-900/60 shrink-0">
                <span className="text-[10px] font-bold text-[#C89543] uppercase tracking-wider block mb-1">
                  Cliente em Atendimento
                </span>
                <h2 className="text-sm font-bold text-white leading-tight">{client.fullName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  CPF: {client.cpf ? maskCpf(client.cpf) : 'Não informado'} • {formatBenefitType(client.benefitType, 'pt-BR') || 'Previdenciário'}
                </p>
                <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cabinetLocation}</span>
                </div>
              </div>

              {/* Configuração de Minutas e Honorários */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Advogado Titular */}
                <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-[#C89543] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Advogado Titular da Minuta</span>
                  </label>
                  <select
                    value={selectedLawyer.name}
                    onChange={(e) => {
                      const l = lawyerOptions.find((opt) => opt.name === e.target.value) || lawyerOptions[0];
                      setSelectedLawyer(l);
                    }}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                  >
                    {lawyerOptions.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.name} ({l.oab})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Escolha da Minuta Contratual Base */}
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

                {/* Função 2: Regime de Remuneração (Quota Litis, Parcelado, Híbrido) */}
                <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-300 block">
                    Regime de Remuneração
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFeeModel('QUOTA_LITIS')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        feeModel === 'QUOTA_LITIS'
                          ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold">Quota Litis</div>
                      <div className="text-[9px] opacity-75">Êxito puro</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeModel('FIXED_INSTALLMENT')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        feeModel === 'FIXED_INSTALLMENT'
                          ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold">Parcelado</div>
                      <div className="text-[9px] opacity-75">Carnê mensal</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeModel('HYBRID')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        feeModel === 'HYBRID'
                          ? 'border-[#C89543] bg-[#C89543]/20 text-white font-bold'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold">Híbrido</div>
                      <div className="text-[9px] opacity-75">Entrada + Êxito</div>
                    </button>
                  </div>

                  {/* Detalhes Quota Litis */}
                  {feeModel === 'QUOTA_LITIS' && (
                    <div className="space-y-2 pt-1">
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
                        className="w-full accent-[#C89543] cursor-pointer"
                      />
                      <div className="text-[11px] text-slate-400 bg-slate-800/80 p-2 rounded">
                        Retroativo Estimado: R$ {estimatedRetroactive.toLocaleString('pt-BR')},00 <br />
                        Honorário Projetado:{' '}
                        <strong className="text-emerald-400">
                          R$ {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR')},00
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Detalhes Parcelamento com Escolha de Vencimento */}
                  {feeModel === 'FIXED_INSTALLMENT' && (
                    <div className="space-y-2 pt-1">
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

                      {/* Escolha do Vencimento: 1ª Parcela e Demais Parcelas */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>1ª Parcela (Entrada):</span>
                          </label>
                          <input
                            type="date"
                            value={firstDueDate}
                            onChange={(e) => {
                              setFirstDueDate(e.target.value);
                              const day = Number(e.target.value.split('-')[2]);
                              if (day && !isNaN(day)) setRecurringDueDay(day);
                            }}
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-medium cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Demais Parcelas:</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">Todo dia</span>
                            <input
                              type="number"
                              min={1}
                              max={31}
                              value={recurringDueDay}
                              onChange={(e) => setRecurringDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-bold text-center"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cronograma explicativo das parcelas */}
                      <div className="text-[10px] text-slate-400 bg-slate-800/80 p-2 rounded leading-relaxed border border-white/5 space-y-0.5">
                        <div className="text-slate-300">
                          <strong>1ª Parcela:</strong> {formattedFirstDueDate} ({Math.round(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                        </div>
                        {installmentsCount > 1 && (
                          <div className="text-emerald-400 font-semibold">
                            Demais parcelas ({installmentsCount - 1}x): todo dia <strong>{recurringDueDay}</strong> dos meses subsequentes.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detalhes Híbrido com Escolha de Vencimento e Êxito */}
                  {feeModel === 'HYBRID' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Parcela Fixa */}
                      <div className="space-y-2 bg-slate-800/60 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[10px] font-bold text-amber-300 block uppercase">
                          1. Entrada / Pro Labore
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Valor Fixo:</span>
                            <input
                              type="number"
                              step={100}
                              value={fixedAmount}
                              onChange={(e) => setFixedAmount(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Parcelas:</span>
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={installmentsCount}
                              onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                            />
                          </div>
                        </div>

                        {/* Vencimento da 1ª Parcela e Demais Parcelas do Híbrido */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>1ª Parcela (Entrada):</span>
                            </label>
                            <input
                              type="date"
                              value={firstDueDate}
                              onChange={(e) => {
                                setFirstDueDate(e.target.value);
                                const day = Number(e.target.value.split('-')[2]);
                                if (day && !isNaN(day)) setRecurringDueDay(day);
                              }}
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-medium cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#C89543] font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Demais Parcelas:</span>
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Todo dia</span>
                              <input
                                type="number"
                                min={1}
                                max={31}
                                value={recurringDueDay}
                                onChange={(e) => setRecurringDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-bold text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Cronograma explicativo das parcelas */}
                        <div className="text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded leading-relaxed border border-white/5 space-y-0.5">
                          <div>
                            <strong>1ª Parcela:</strong> {formattedFirstDueDate} ({Math.round(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                          </div>
                          {installmentsCount > 1 && (
                            <div className="text-emerald-400 font-semibold">
                              Demais ({installmentsCount - 1}x): todo dia <strong>{recurringDueDay}</strong> dos meses subsequentes.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Parcela de Êxito */}
                      <div className="space-y-1.5 bg-slate-800/60 p-2.5 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[10px] font-bold text-[#C89543] uppercase">
                            2. Êxito sobre atrasados
                          </span>
                          <span className="font-bold text-[#C89543]">{quotaLitisPercentage}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={50}
                          step={5}
                          value={quotaLitisPercentage}
                          onChange={(e) => setQuotaLitisPercentage(Number(e.target.value))}
                          className="w-full accent-[#C89543] cursor-pointer"
                        />
                        <div className="text-[11px] text-slate-400 bg-slate-800/80 p-2 rounded">
                          Previsão de Êxito:{' '}
                          <strong className="text-emerald-400">
                            R$ {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR')},00
                          </strong>
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

              {/* Rodapé da Coluna 1 */}
              <div className="p-3 bg-slate-900 border-t border-white/10 shrink-0 space-y-2">
                <button
                  type="button"
                  onClick={handleFormalize}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#168447] hover:bg-[#126b39] text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Formalizando...' : `Formalizar Kit Completo (${selectedKitCount})`}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintBatch}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#082A52] hover:bg-[#0c396d] text-white text-xs font-bold border border-[#C89543]/40 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4 text-[#C89543]" />
                  <span>Imprimir Documentos Selecionados</span>
                </button>
              </div>
            </aside>
          )}

          {/* ========================================================================= */}
          {/* COLUNA 2 (MEIO): DOCUMENTOS VINCULADOS À MINUTA (COM CHECKBOXES)          */}
          {/* ========================================================================= */}
          {!isSidebarsHidden && (
            <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col h-full overflow-hidden transition-all duration-200">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Layers className="w-4 h-4 text-[#C89543]" />
                  <span>Documentos Vinculados à Minuta</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                  {availableDocuments.length} disponíveis
                </span>
              </div>

              {/* Lista Vertical de Cards */}
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

                      <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{doc.description}</p>

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
                          className="text-[#C89543] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
          )}

          {/* ========================================================================= */}
          {/* COLUNA 3 (DIREITA): FOLHA A4 CENTRAL EM FOCO (EXPANSÍVEL PARA 100%)       */}
          {/* ========================================================================= */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-300/80 h-full">
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

                {isSidebarsHidden && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarsHidden(false)}
                    className="ml-2 text-xs font-semibold text-[#0B78D0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5" />
                    <span>Restaurar Painéis</span>
                  </button>
                )}
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
                  onClick={handlePrintSingle}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#082A52] text-white hover:bg-[#0c396d] cursor-pointer shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Imprimir Esta Folha</span>
                </button>
              </div>
            </div>

            {/* Folha A4 Renderizada */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 flex justify-center items-start">
              <div
                id="demo-a4-printable-area"
                className="bg-white w-full max-w-[800px] min-h-[1130px] shadow-2xl rounded-xs border border-slate-300 p-10 sm:p-14 text-slate-900 text-xs sm:text-sm leading-relaxed flex flex-col justify-between shrink-0 mb-12"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900">
                      <span className="font-bold">Modo de Edição Livre Ativo</span>
                      <span>As alterações serão salvas neste documento para este cliente</span>
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
                          <strong className="block text-slate-900">{selectedLawyer.name}</strong>
                          <span className="text-slate-600 text-[11px]">{selectedLawyer.oab} • ADVOGADO(A)</span>
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
      </div>
    </div>
  );
}

export default LegalContractModal;
