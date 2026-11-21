'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  FileSignature,
  Scale,
  Sparkles,
  CheckCircle2,
  FolderLock,
  ShieldCheck,
  FileText,
  UserCheck,
  Edit3,
  Copy,
  Check,
  Percent,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { settingsStore } from '@/lib/data/mock-settings';
import type { Client } from '@/types/client';
import type { ContractTemplate, FeeModel } from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import {
  mergeTemplatePlaceholders,
  generateLawyerFeeClause,
  generateFeeInstallments,
} from '@/lib/utils/template-engine';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import { formatBenefitType, getCanonicalBenefitKey } from '@/lib/utils/benefit-translations';

const DEFAULT_POA_TEMPLATE = `PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: {{NOME_CLIENTE}}, brasileiro(a), {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, inscrito(a) no CPF/MF sob o nº {{CPF}}, portador(a) do RG nº {{RG}}, residente e domiciliado(a) em {{ENDERECO}}, telefone/WhatsApp: {{TELEFONE}}.

OUTORGADOS: Dr(a). {{NOME_ADVOGADO}}, advogado(a) inscrito(a) na Ordem dos Advogados do Brasil sob a {{OAB_ADVOGADO}}, bem como os advogados integrantes da sociedade {{NOME_ESCRITORIO}}, com endereço profissional onde recebem notificações, intimações e correspondências de estilo.

PODERES DA CLÁUSULA AD JUDICIA ET EXTRA:
Por este instrumento particular de procuração, o(a) Outorgante confere aos outorgados amplos e gerais poderes da cláusula ad judicia et extra para o foro em geral perante qualquer Juízo, Instância ou Tribunal, bem como perante autarquias públicas federais e estaduais, mormente o INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS), Conselho de Recursos da Previdência Social (CRPS), e Justiça Federal.

PODERES ESPECIAIS EXPRESSOS (ART. 105 DO CPC):
Confere ainda poderes especiais e expressos para requerer, desistir, transigir, acordar, anuir, firmar compromissos, receber citações e intimações, interpor recursos administrativos e judiciais, renunciar a valores excedentes ao teto dos Juizados Especiais Federais (quando conveniente ao processo), dar e receber quitação total ou parcial, e expressamente RECEBER E LEVANTAR ALVARÁS JUDICIAIS, PRECATÓRIOS E REQUISIÇÕES DE PEQUENO VALOR (RPV) perante a Caixa Econômica Federal e o Banco do Brasil S/A, retendo a cota-parte dos honorários advocatícios contratados, substabelecer com ou sem reserva de iguais poderes, dando tudo por bom, firme e valioso.

FINALIDADE ESPECÍFICA DO MANDATO:
A presente procuração destina-se especificamente ao pleito, concessão e liquidação do benefício previdenciário de {{BENEFICIO}} (Pasta Documental: {{PASTA_FISICA}}).`;

interface LegalContractModalProps {
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
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();

  const lawyerOptions = useMemo(() => {
    const list = [];
    if (currentUser?.fullName) {
      list.push({ name: currentUser.fullName, oab: currentUser.oabNumber || 'OAB' });
    }
    list.push({ name: 'Advogado Titular', oab: 'OAB' });
    return list;
  }, [currentUser]);

  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<'contrato' | 'procuracao' | 'capa'>('contrato');
  const [selectedLawyer, setSelectedLawyer] = useState(() => lawyerOptions[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Inline editing states for Contract
  const [isEditingCustomBody, setIsEditingCustomBody] = useState(false);
  const [customBody, setCustomBody] = useState('');
  const [isContractEditedManually, setIsContractEditedManually] = useState(false);

  // Inline editing states for POA (Procuração)
  const [isEditingCustomPoa, setIsEditingCustomPoa] = useState(false);
  const [customPoaBody, setCustomPoaBody] = useState('');
  const [isPoaEditedManually, setIsPoaEditedManually] = useState(false);

  // Dynamic Office Name & OAB from tenant registration
  const [officeName, setOfficeName] = useState(() => settingsStore.getOfficeSettings().officeName || 'Alexandre Pontes Sociedade de Advogados');
  const [officeOab, setOfficeOab] = useState(() => settingsStore.getOfficeSettings().oabSocietyNumber || 'OAB/AM');

  // Remuneration regime states (Regime de Remuneração e Honorários Advocatícios)
  const [feeModel, setFeeModel] = useState<FeeModel>('QUOTA_LITIS');
  const [quotaLitisPercentage, setQuotaLitisPercentage] = useState(30);
  const [estimatedRetroactive, setEstimatedRetroactive] = useState(36000);
  const [fixedAmount, setFixedAmount] = useState(2400);
  const [installmentsCount, setInstallmentsCount] = useState(6);
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [appliedFeeFeedback, setAppliedFeeFeedback] = useState(false);

  const [isFormSaved, setIsFormSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'config' | 'doc'>('doc');

  // Fetch real registered office name from Supabase tenants table
  useEffect(() => {
    if (!currentUser?.tenantId) return;
    const supabase = createClient();
    (supabase.from('tenants') as any)
      .select('office_name, oab_number')
      .eq('id', currentUser.tenantId)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.office_name) setOfficeName(data.office_name);
        if (data?.oab_number) setOfficeOab(data.oab_number);
      })
      .catch((err: any) => console.warn('Não foi possível carregar dados do escritório:', err));
  }, [currentUser?.tenantId]);

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      const allTemplates = contractsStore.getTemplates();
      setTemplates(allTemplates);

      // Only auto-select on initial open if no template is currently selected or if selected template is not in store
      setSelectedTemplateId((currentId) => {
        if (currentId && allTemplates.some((t) => t.id === currentId)) {
          return currentId;
        }

        const clientCanonical = getCanonicalBenefitKey(client.benefitType);
        const matchingBenefitTpl = allTemplates.find((tpl) => {
          if (!client.benefitType) return false;
          const tplCanonical = getCanonicalBenefitKey(tpl.benefitSpecies);
          return (
            tplCanonical === clientCanonical ||
            tpl.benefitSpecies.toLowerCase().includes(client.benefitType.toLowerCase()) ||
            tpl.title.toLowerCase().includes(client.benefitType.toLowerCase()) ||
            client.benefitType.toLowerCase().includes(tpl.benefitSpecies.toLowerCase())
          );
        });
        const matchingLawyerTpl = allTemplates.find(
          (tpl) => tpl.lawyerName === selectedLawyer.name && tpl.isDefault
        );
        const defaultTpl =
          matchingBenefitTpl ||
          matchingLawyerTpl ||
          allTemplates.find((tpl) => tpl.isDefault) ||
          allTemplates[0];

        if (defaultTpl?.defaultFeeModel) {
          setFeeModel(defaultTpl.defaultFeeModel);
        }
        if (defaultTpl?.defaultQuotaLitisPercentage) {
          setQuotaLitisPercentage(defaultTpl.defaultQuotaLitisPercentage);
        }
        return defaultTpl ? defaultTpl.id : '';
      });
    }
  }, [isOpen, client.benefitType]);

  const selectedTemplate = useMemo(() => {
    return templates.find((tpl) => tpl.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat(locale === 'en-US' ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, [locale]);

  const fullAddress = useMemo(() => {
    return [
      client.street,
      client.streetNumber ? `nº ${client.streetNumber}` : 'S/N',
      client.complement,
      client.neighborhood,
      client.city ? `${client.city} - ${client.state || 'AM'}` : '',
      client.postalCode ? `CEP: ${client.postalCode}` : '',
    ]
      .filter(Boolean)
      .join(', ');
  }, [client]);

  const cabinetLocation = useMemo(() => {
    return client.physicalFileLocation || 'Armário Geral do Escritório';
  }, [client]);

  // Dynamic Lawyer Standard Fee Clause
  const generatedFeeClause = useMemo(() => {
    return generateLawyerFeeClause({
      feeModel,
      quotaLitisPercentage,
      estimatedRetroactiveAmount: estimatedRetroactive,
      fixedTotalAmount: fixedAmount,
      installmentCount: installmentsCount,
      firstDueDate,
    });
  }, [
    feeModel,
    quotaLitisPercentage,
    estimatedRetroactive,
    fixedAmount,
    installmentsCount,
    firstDueDate,
  ]);

  // Merge template with client data whenever template, lawyer or fee parameters change
  useEffect(() => {
    if (selectedTemplate && !isEditingCustomBody && !isContractEditedManually) {
      const merged = mergeTemplatePlaceholders(selectedTemplate.contentBody, {
        clientName: client.fullName,
        clientCpf: client.cpf ? maskCpf(client.cpf) : '___.___.___-__',
        clientRg: client.rg || 'Não informado',
        clientMaritalStatus:
          client.maritalStatus === 'MARRIED'
            ? 'Casado(a)'
            : client.maritalStatus === 'SINGLE'
            ? 'Solteiro(a)'
            : client.maritalStatus === 'DIVORCED'
            ? 'Divorciado(a)'
            : client.maritalStatus === 'WIDOWED'
            ? 'Viúvo(a)'
            : 'União Estável',
        clientProfession: client.profession || 'Agricultor(a) Familiar',
        clientAddress: fullAddress || 'Domiciliado(a) no Estado da Paraíba',
        clientPhone: client.phone || 'Não informado',
        benefitSpecies: client.benefitType || selectedTemplate.benefitSpecies || 'Aposentadoria Previdenciária',
        feeDescription: generatedFeeClause,
        lawyerName: selectedLawyer.name,
        lawyerOab: selectedLawyer.oab,
        officeName,
        officeOab,
        cabinetFolder: cabinetLocation,
        fullDate: todayFormatted,
      });
      setCustomBody(merged);
    }
  }, [
    selectedTemplate,
    selectedLawyer,
    generatedFeeClause,
    client,
    fullAddress,
    cabinetLocation,
    todayFormatted,
    officeName,
    officeOab,
    isEditingCustomBody,
    isContractEditedManually,
  ]);

  // Merge default POA with client data
  useEffect(() => {
    if (!isEditingCustomPoa && !isPoaEditedManually) {
      const mergedPoa = mergeTemplatePlaceholders(DEFAULT_POA_TEMPLATE, {
        clientName: client.fullName,
        clientCpf: client.cpf ? maskCpf(client.cpf) : '___.___.___-__',
        clientRg: client.rg || 'Não informado',
        clientMaritalStatus:
          client.maritalStatus === 'MARRIED'
            ? 'Casado(a)'
            : client.maritalStatus === 'SINGLE'
            ? 'Solteiro(a)'
            : client.maritalStatus === 'DIVORCED'
            ? 'Divorciado(a)'
            : client.maritalStatus === 'WIDOWED'
            ? 'Viúvo(a)'
            : 'União Estável',
        clientProfession: client.profession || 'Agricultor(a) Familiar',
        clientAddress: fullAddress || 'Domiciliado(a) no Estado da Paraíba',
        clientPhone: client.phone || 'Não informado',
        benefitSpecies: client.benefitType || selectedTemplate?.benefitSpecies || 'Aposentadoria Previdenciária',
        feeDescription: `${quotaLitisPercentage}% (${quotaLitisPercentage} por cento)`,
        lawyerName: selectedLawyer.name,
        lawyerOab: selectedLawyer.oab,
        officeName,
        officeOab,
        cabinetFolder: cabinetLocation,
        fullDate: todayFormatted,
      });
      setCustomPoaBody(mergedPoa);
    }
  }, [selectedLawyer, client, fullAddress, cabinetLocation, todayFormatted, officeName, officeOab, selectedTemplate, isEditingCustomPoa, isPoaEditedManually]);

  if (!isOpen) return null;

  const handleLawyerChange = (name: string) => {
    const l = lawyerOptions.find((opt) => opt.name === name) || lawyerOptions[0];
    setSelectedLawyer(l);
    setIsEditingCustomBody(false);

    // Pick that lawyer's default template if available
    const lawyerDefaultTpl = templates.find(
      (tpl) => tpl.lawyerName === l.name && tpl.isDefault
    );
    if (lawyerDefaultTpl) {
      setSelectedTemplateId(lawyerDefaultTpl.id);
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    setIsEditingCustomBody(false);
    setIsContractEditedManually(false);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      if (tpl.defaultFeeModel) {
        setFeeModel(tpl.defaultFeeModel);
      }
      if (tpl.defaultQuotaLitisPercentage) {
        setQuotaLitisPercentage(tpl.defaultQuotaLitisPercentage);
      }
      if (tpl.lawyerName) {
        const matchingLawyer = lawyerOptions.find((l) => l.name === tpl.lawyerName);
        if (matchingLawyer) setSelectedLawyer(matchingLawyer);
      }
    }
  };

  const handleApplyFeeRegime = () => {
    if (!selectedTemplate) return;
    setIsContractEditedManually(false);
    setIsEditingCustomBody(false);
    setSelectedDoc('contrato');
    const merged = mergeTemplatePlaceholders(selectedTemplate.contentBody, {
      clientName: client.fullName,
      clientCpf: client.cpf ? maskCpf(client.cpf) : '___.___.___-__',
      clientRg: client.rg || 'Não informado',
      clientMaritalStatus:
        client.maritalStatus === 'MARRIED'
          ? 'Casado(a)'
          : client.maritalStatus === 'SINGLE'
          ? 'Solteiro(a)'
          : client.maritalStatus === 'DIVORCED'
          ? 'Divorciado(a)'
          : client.maritalStatus === 'WIDOWED'
          ? 'Viúvo(a)'
          : 'União Estável',
      clientProfession: client.profession || 'Agricultor(a) Familiar',
      clientAddress: fullAddress || 'Domiciliado(a) no Estado da Paraíba',
      clientPhone: client.phone || 'Não informado',
      benefitSpecies: client.benefitType || selectedTemplate.benefitSpecies || 'Aposentadoria Previdenciária',
      feeDescription: generatedFeeClause,
      lawyerName: selectedLawyer.name,
      lawyerOab: selectedLawyer.oab,
      officeName,
      officeOab,
      cabinetFolder: cabinetLocation,
      fullDate: todayFormatted,
    });
    setCustomBody(merged);
    setAppliedFeeFeedback(true);
    setTimeout(() => setAppliedFeeFeedback(false), 2500);
  };

  const handleCopyText = () => {
    if (selectedDoc === 'contrato' && isEditingCustomBody) {
      navigator.clipboard.writeText(customBody);
    } else if (selectedDoc === 'procuracao' && isEditingCustomPoa) {
      navigator.clipboard.writeText(customPoaBody);
    } else {
      const printableArea = document.getElementById('client-contract-printable-area');
      const text = printableArea ? printableArea.innerText : customBody;
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High-fidelity isolated A4 print
  const handlePrint = () => {
    let needsDelay = false;
    if (isEditingCustomBody) {
      setIsEditingCustomBody(false);
      needsDelay = true;
    }
    if (isEditingCustomPoa) {
      setIsEditingCustomPoa(false);
      needsDelay = true;
    }
    if (needsDelay) {
      setTimeout(executePrint, 60);
      return;
    }
    executePrint();
  };

  const executePrint = () => {
    const printableArea = document.getElementById('client-contract-printable-area');
    if (!printableArea) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;'
    );
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="${locale === 'en-US' ? 'en-US' : 'pt-BR'}">
        <head>
          <meta charset="utf-8" />
          <title>${locale === 'en-US' ? 'Official OAB Document' : 'Documento Oficial OAB'} - ${client.fullName}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 15mm 15mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #FFFFFF !important;
              color: #0F172A !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              font-size: 10.5pt !important;
              line-height: 1.55 !important;
            }
            .a4-print-sheet {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              box-shadow: none !important;
              border: none !important;
            }
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div class="a4-print-sheet">
            ${printableArea.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1200);
    }, 300);
  };

  const handleFormalizeAndSaveContract = async () => {
    const contractNumber = `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const isEdited = isContractEditedManually || isPoaEditedManually;

    const projectedSuccessFee =
      feeModel !== 'FIXED_INSTALLMENT'
        ? (estimatedRetroactive * quotaLitisPercentage) / 100
        : undefined;

    const installments =
      feeModel !== 'QUOTA_LITIS'
        ? generateFeeInstallments(fixedAmount, installmentsCount, firstDueDate, contractNumber)
        : [];

    // 1. Save in local & localStorage ContractsStore
    contractsStore.createContract({
      tenantId: currentUser?.tenantId || 'tenant-001',
      clientId: client.id,
      clientName: client.fullName,
      clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
      clientPhone: client.mobilePhone || client.phone ? maskPhone(client.mobilePhone || client.phone) : undefined,
      contractNumber,
      templateId: selectedTemplate?.id,
      templateTitle: selectedTemplate?.title,
      benefitSpecies: formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Previdenciária',
      status: 'ACTIVE',
      feeStructure: {
        feeModel,
        quotaLitisPercentage: feeModel !== 'FIXED_INSTALLMENT' ? quotaLitisPercentage : undefined,
        estimatedRetroactiveAmount:
          feeModel !== 'FIXED_INSTALLMENT' ? estimatedRetroactive : undefined,
        estimatedSuccessFeeAmount: projectedSuccessFee,
        fixedTotalAmount: feeModel !== 'QUOTA_LITIS' ? fixedAmount : undefined,
        installmentCount: feeModel !== 'QUOTA_LITIS' ? installmentsCount : 0,
        installments,
      },
      physicalSignedStatus: 'PENDING',
      lawyerName: selectedLawyer.name,
      lawyerOab: selectedLawyer.oab,
      officeName,
      issuedAt: new Date().toISOString(),
      physicalFileLocation: cabinetLocation,
      isCustomEdited: isEdited,
      customEditedBy: isEdited ? (currentUser?.fullName || selectedLawyer.name) : undefined,
      customEditedAt: isEdited ? new Date().toISOString() : undefined,
      customContractBody: customBody,
      customPoaBody: customPoaBody,
    });

    // 2. Persist in Supabase Database
    try {
      const supabase = createClient();
      const { error: insertError } = await (supabase.from('contracts') as any).insert({
        tenant_id: currentUser?.tenantId || 'tenant-001',
        client_id: client.id,
        contract_number: contractNumber,
        template_id: selectedTemplate?.id,
        template_title: selectedTemplate?.title,
        benefit_species: formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Previdenciária',
        status: 'ACTIVE',
        fee_structure: {
          feeModel,
          quotaLitisPercentage: feeModel !== 'FIXED_INSTALLMENT' ? quotaLitisPercentage : null,
          estimatedRetroactiveAmount:
            feeModel !== 'FIXED_INSTALLMENT' ? estimatedRetroactive : null,
          estimatedSuccessFeeAmount: projectedSuccessFee ?? null,
          fixedTotalAmount: feeModel !== 'QUOTA_LITIS' ? fixedAmount : null,
          installmentCount: feeModel !== 'QUOTA_LITIS' ? installmentsCount : 0,
          installments: installments.map((i) => ({
            installmentNumber: i.installmentNumber,
            amount: i.amount,
            dueDate: i.dueDate,
            status: i.status,
          })),
        },
        lawyer_name: selectedLawyer.name,
        lawyer_oab: selectedLawyer.oab,
        office_name: officeName,
        physical_signed_status: 'PENDING',
        physical_file_location: cabinetLocation,
        is_custom_edited: isEdited,
        custom_edited_by: isEdited ? (currentUser?.fullName || selectedLawyer.name) : null,
        custom_edited_at: isEdited ? new Date().toISOString() : null,
        custom_contract_body: customBody,
        custom_poa_body: customPoaBody,
        issued_at: new Date().toISOString(),
      });

      if (insertError) {
        console.warn('Aviso ao persistir no Supabase (mantido no contractsStore):', insertError);
      }

      // ONLY if edited: log audit event in attendances table
      if (isEdited && client.id) {
        const editDetails = [
          isContractEditedManually ? 'Contrato de Honorários' : null,
          isPoaEditedManually ? 'Procuração Ad Judicia' : null,
        ].filter(Boolean).join(' e ');

        const { error: attendanceError } = await (supabase.from('attendances') as any).insert({
          tenant_id: currentUser?.tenantId || 'tenant-001',
          client_id: client.id,
          attendance_type: 'RETURN',
          objective: `Formalização de Contrato OAB (${contractNumber})`,
          notes: `[DOCUMENTO EDITADO]: O documento (${editDetails}) foi personalizado manualmente para este cliente em ${new Date().toLocaleString('pt-BR')} por ${currentUser?.fullName || selectedLawyer.name}.`,
          attendant_name: currentUser?.fullName || selectedLawyer.name,
          attendant_user_id: currentUser?.id,
          physical_file_location: cabinetLocation,
        });

        if (attendanceError) {
          console.warn('Aviso ao registrar auditoria em attendances:', attendanceError);
        }
      }
    } catch (err) {
      console.warn('Could not persist contract in Supabase (persisted in contractsStore):', err);
    }

    setIsFormSaved(true);
    if (onContractIssued) {
      onContractIssued(contractNumber);
    }
    setTimeout(() => {
      setIsFormSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-1 sm:p-3 md:p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-[98vw] 2xl:max-w-7xl h-[96vh] max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Status Bar (Discreto com controle de visualização do modelo temporário) */}
        <div className="bg-[#081322] text-white px-3 sm:px-4 py-2 border-b border-white/10 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#C89543] font-bold uppercase tracking-wider text-[11px]">
              <FileSignature className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Emissão Oficial de Procuração e Contrato OAB</span>
              <span className="sm:hidden">Contrato OAB</span>
            </div>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline font-bold text-slate-200">{client.fullName}</span>
            <span className="hidden lg:inline text-slate-400 font-mono text-[11px]">(CPF: {maskCpf(client.cpf)})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Tab Switcher (< md) */}
            <div className="flex md:hidden items-center bg-slate-800 rounded-lg p-0.5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setMobileTab('config')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  mobileTab === 'config' ? 'bg-[#C89543] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Parâmetros
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('doc')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  mobileTab === 'doc' ? 'bg-[#C89543] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ver Folha A4
              </button>
            </div>

            {/* Desktop Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              title={isSidebarOpen ? 'Ocultar Painel Lateral para Modo Leitura 100%' : 'Mostrar Painel de Configurações'}
            >
              {isSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Ocultar Painel</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Mostrar Painel</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar"
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area (2 Colunas) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* COLUNA ESQUERDA: Painel Lateral de Configurações */}
          <div
            className={`
              w-full md:w-[380px] lg:w-[410px] xl:w-[430px] shrink-0 bg-[#0B192E] text-white flex flex-col border-b md:border-b-0 md:border-r border-white/10 h-full overflow-hidden transition-all duration-200
              ${!isSidebarOpen ? 'md:hidden' : ''}
              ${mobileTab === 'doc' ? 'hidden md:flex' : 'flex'}
            `}
          >
            {/* Header da Coluna Esquerda */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 shrink-0 bg-slate-900/50">
              <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                {client.fullName}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                CPF: {maskCpf(client.cpf)} • {formatBenefitType(client.benefitType, locale === 'en-US' ? 'en-US' : 'pt-BR')}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C89543] bg-[#C89543]/10 px-2 py-0.5 rounded border border-[#C89543]/20">
                <FolderLock className="w-3 h-3" />
                <span>Pasta Física: {cabinetLocation}</span>
              </div>
            </div>

            {/* Corpo Rolável de Configurações */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
              {/* Seletores de Advogado e Minuta */}
              <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/10">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#C89543] mb-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Advogado Titular da Minuta</span>
                  </label>
                  <select
                    value={selectedLawyer.name}
                    onChange={(e) => handleLawyerChange(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                  >
                    {lawyerOptions.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.name} ({l.oab})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#C89543] mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Minuta Padrão Vinculada</span>
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.title} {tpl.isDefault ? '★ Padrão' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seção 3: Regime de Remuneração e Honorários */}
              <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#C89543] uppercase tracking-wide">
                    3. Regime de Remuneração
                  </label>
                  {appliedFeeFeedback && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 animate-in fade-in duration-150">
                      ✓ Atualizado!
                    </span>
                  )}
                </div>

                {/* 3 Model Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFeeModel('QUOTA_LITIS')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      feeModel === 'QUOTA_LITIS'
                        ? 'border-[#C89543] bg-[#0B192E] ring-2 ring-[#C89543]/40 shadow-xs'
                        : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-white">Quota Litis</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Êxito puro</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeeModel('FIXED_INSTALLMENT')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      feeModel === 'FIXED_INSTALLMENT'
                        ? 'border-[#C89543] bg-[#0B192E] ring-2 ring-[#C89543]/40 shadow-xs'
                        : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-white">Parcelado</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Carnê mensal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeeModel('HYBRID')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      feeModel === 'HYBRID'
                        ? 'border-[#C89543] bg-[#0B192E] ring-2 ring-[#C89543]/40 shadow-xs'
                        : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-white">Híbrido</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Entrada + Êxito</div>
                  </button>
                </div>

                {/* Sub-inputs based on regime */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  {/* Quota Litis Inputs */}
                  {feeModel !== 'FIXED_INSTALLMENT' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                          Êxito (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={10}
                            max={50}
                            value={quotaLitisPercentage}
                            onChange={(e) => setQuotaLitisPercentage(Number(e.target.value))}
                            className="w-full pl-2.5 pr-6 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                          />
                          <Percent className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                          Atrasados (R$)
                        </label>
                        <input
                          type="number"
                          step="500"
                          value={estimatedRetroactive}
                          onChange={(e) => setEstimatedRetroactive(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                        />
                      </div>

                      <div className="col-span-2 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                        Previsão de Êxito: R${' '}
                        {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}

                  {/* Installments Inputs */}
                  {feeModel !== 'QUOTA_LITIS' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                            Valor Fixo (R$)
                          </label>
                          <input
                            type="number"
                            step="100"
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                            Nº Parcelas
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={24}
                            value={installmentsCount}
                            onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                          1º Vencimento
                        </label>
                        <input
                          type="date"
                          value={firstDueDate}
                          onChange={(e) => setFirstDueDate(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                        />
                      </div>

                      <div className="text-[10px] text-slate-300 bg-slate-800/60 p-1.5 rounded">
                        Parcelamento:{' '}
                        <strong className="text-white">
                          {installmentsCount}x de R${' '}
                          {(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* OK Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleApplyFeeRegime}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C89543] hover:bg-[#b07d32] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar Cláusula na Folha (OK)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé da Coluna Esquerda: Ações Principais */}
            <div className="p-3 bg-slate-950/80 border-t border-white/10 shrink-0 space-y-2">
              <button
                type="button"
                onClick={handleFormalizeAndSaveContract}
                disabled={isFormSaved}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#168447] hover:bg-[#126b39] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFormSaved ? 'Formalizado com Sucesso!' : 'Formalizar e Salvar no Hub'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-xs transition-all cursor-pointer border border-[#C89543]/40"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Imprimir A4</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Área Nobre da Folha A4 em Tela Cheia */}
          <div
            className={`
              flex-1 min-h-0 flex flex-col bg-slate-200 h-full overflow-hidden
              ${mobileTab === 'config' ? 'hidden md:flex' : 'flex'}
            `}
          >
            {/* Top Bar da Folha A4 com Abas de Documentos e Ações Rápidas */}
            <div className="bg-white border-b border-slate-300 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-xs">
              {/* Abas dos 3 Documentos */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedDoc('contrato')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    selectedDoc === 'contrato'
                      ? 'bg-[#082A52] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#C89543]" />
                  <span>1. Contrato de Honorários</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDoc('procuracao')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    selectedDoc === 'procuracao'
                      ? 'bg-[#082A52] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#C89543]" />
                  <span>2. Procuração Ad Judicia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDoc('capa')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    selectedDoc === 'capa'
                      ? 'bg-[#082A52] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FolderLock className="w-4 h-4 text-[#C89543]" />
                  <span>3. Capa de Pasta</span>
                </button>
              </div>

              {/* Ações da Folha: Edição inline e Ações Rápidas */}
              <div className="flex items-center gap-2">
                {selectedDoc === 'contrato' && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCustomBody(!isEditingCustomBody)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#0B78D0] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingCustomBody ? 'Visualizar Formato Impresso' : 'Editar Cláusulas'}</span>
                  </button>
                )}

                {selectedDoc === 'procuracao' && (
                  <button
                    type="button"
                    onClick={() => setIsEditingCustomPoa(!isEditingCustomPoa)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#0B78D0] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingCustomPoa ? 'Visualizar Formato Impresso' : 'Editar Procuração'}</span>
                  </button>
                )}

                {/* Se a barra lateral estiver fechada, botão de imprimir rápido */}
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>Imprimir</span>
                  </button>
                )}
              </div>
            </div>

            {/* Canvas de Leitura e Rolagem da Folha A4 com 100% da altura útil */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-slate-300/70 flex justify-center items-start">
              <div
                id="client-contract-printable-area"
                className="bg-white w-full max-w-[794px] min-h-[1123px] h-auto shadow-2xl rounded-xs border border-slate-300 p-8 sm:p-14 md:p-16 text-slate-900 text-xs sm:text-sm leading-relaxed space-y-6 flex flex-col justify-between shrink-0 mb-8"
              >
            {/* DOCUMENT 1: CONTRATO DE HONORÁRIOS */}
            {selectedDoc === 'contrato' && (
              <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="text-center border-b-2 border-[#082A52] pb-4 mb-5">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {officeName} • {officeOab}
                    </div>
                    <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1 tracking-tight">
                      Contrato de Prestação de Serviços Advocatícios e Honorários
                    </h2>
                  </div>

                  {/* Edit inline toggle */}
                  <div className="print:hidden flex justify-end pb-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingCustomBody(!isEditingCustomBody)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B78D0] hover:underline"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingCustomBody ? 'Visualizar Formato Impresso' : 'Editar Cláusulas Específicas deste Cliente'}</span>
                    </button>
                  </div>

                  {isEditingCustomBody ? (
                    <div className="space-y-2">
                      <span className="text-[11px] text-amber-800 font-semibold block">
                        Você está editando o texto exclusivo para {client.fullName}. (O modelo padrão global não será alterado).
                      </span>
                      <textarea
                        rows={18}
                        value={customBody}
                        onChange={(e) => {
                          setCustomBody(e.target.value);
                          setIsContractEditedManually(true);
                        }}
                        className="w-full p-3 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B78D0]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {customBody}
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="pt-8 space-y-8 break-inside-avoid text-xs">
                  <div className="text-right text-slate-600">
                    {locale === 'en-US' ? `Location, ${todayFormatted}.` : `Localidade, ${todayFormatted}.`}
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-center pt-2">
                    <div className="border-t border-slate-800 pt-1.5">
                      <strong className="block text-slate-900">{client.fullName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {locale === 'en-US' ? 'CLIENT' : 'CONTRATANTE'} • {locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} {maskCpf(client.cpf)}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-1.5">
                      <strong className="block text-slate-900">{selectedLawyer.name}</strong>
                      <span className="text-[11px] text-slate-500">
                        {selectedLawyer.oab} • {locale === 'en-US' ? 'LAW FIRM' : 'CONTRATADA'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? '1st Witness:' : '1ª Testemunha:'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>

                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? '2nd Witness:' : '2ª Testemunha:'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 2: PROCURAÇÃO AD JUDICIA */}
            {selectedDoc === 'procuracao' && (
              <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {officeName} • {officeOab}
                    </div>
                    <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
                      Procuração Ad Judicia et Extra
                    </h2>
                    <div className="text-xs text-[#168447] font-bold mt-0.5">
                      Representação Previdenciária e Processual (Art. 105 CPC)
                    </div>
                  </div>

                  {/* Edit inline toggle for POA */}
                  <div className="print:hidden flex justify-end pb-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingCustomPoa(!isEditingCustomPoa)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B78D0] hover:underline"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingCustomPoa ? 'Visualizar Formato Impresso' : 'Editar Cláusulas da Procuração deste Cliente'}</span>
                    </button>
                  </div>

                  {isEditingCustomPoa ? (
                    <div className="space-y-2">
                      <span className="text-[11px] text-amber-800 font-semibold block">
                        Você está editando a procuração exclusiva para {client.fullName}. (O modelo padrão global não será alterado).
                      </span>
                      <textarea
                        rows={18}
                        value={customPoaBody}
                        onChange={(e) => {
                          setCustomPoaBody(e.target.value);
                          setIsPoaEditedManually(true);
                        }}
                        className="w-full p-3 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B78D0]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {customPoaBody}
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="pt-8 space-y-8 break-inside-avoid text-xs">
                  <div className="text-right text-slate-600">
                    {locale === 'en-US' ? `Location, ${todayFormatted}.` : `Localidade, ${todayFormatted}.`}
                  </div>

                  <div className="max-w-xs mx-auto border-t border-slate-800 pt-2 text-center">
                    <strong className="block text-slate-900">{client.fullName}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {locale === 'en-US' ? 'PRINCIPAL' : 'OUTORGANTE'} • {locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} {maskCpf(client.cpf)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? 'Signature on Behalf (if illiterate):' : 'Assinatura a Rogo (se analfabeto):'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>

                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? 'Attesting Witness:' : 'Testemunha Instrumentária:'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 3: CAPA DE PASTA FÍSICA */}
            {selectedDoc === 'capa' && (
              <div className="border-4 border-double border-[#082A52] p-6 sm:p-8 rounded-lg space-y-6">
                <div className="text-center border-b-2 border-[#082A52] pb-4">
                  <div className="flex items-center justify-center gap-2 text-[#082A52] mb-1">
                    <Scale className="w-5 h-5 text-[#C89543]" />
                    <span className="font-bold uppercase tracking-wider text-xs">{officeName}</span>
                  </div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-[#082A52] uppercase tracking-tight">
                    {locale === 'en-US' ? 'Social Security Case File' : 'Dossiê do Processo Previdenciário'}
                  </h2>
                  <div className="text-xs text-[#C89543] font-bold uppercase tracking-widest mt-0.5">
                    {locale === 'en-US' ? 'Central Physical Archive • OAB Records Management' : 'Arquivo Físico Central • Gestão Documental OAB'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {locale === 'en-US' ? 'Folder Identification' : 'Identificação da Pasta'}
                    </span>
                    <div className="text-2xl font-mono font-extrabold text-[#082A52]">
                      {client.physicalFileLocation || 'PASTA 2026-PEND'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {locale === 'en-US' ? 'Cabinet & Drawer' : 'Armário e Gaveta'}
                    </span>
                    <div className="text-sm font-bold text-[#C89543]">
                      {cabinetLocation}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
                    {locale === 'en-US' ? 'Client Registration Data' : 'Dados Cadastrais do Segurado(a)'}
                  </h3>
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium w-40">{locale === 'en-US' ? 'Full Name:' : 'Nome Completo:'}</td>
                        <td className="py-1.5 font-bold text-slate-900">{client.fullName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'}</td>
                        <td className="py-1.5 font-mono font-bold text-slate-900">{maskCpf(client.cpf)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Benefit Species:' : 'Espécie do Benefício:'}</td>
                        <td className="py-1.5 font-bold text-[#082A52]">{formatBenefitType(client.benefitType, locale === 'en-US' ? 'en-US' : 'pt-BR')}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Responsible Attorney:' : 'Advogado Patrono:'}</td>
                        <td className="py-1.5 text-slate-800 font-semibold">{selectedLawyer.name} ({selectedLawyer.oab})</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Contact Phone:' : 'Telefone de Contato:'}</td>
                        <td className="py-1.5 text-slate-800">{client.phone || (locale === 'en-US' ? 'Not informed' : 'Não informado')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
                    {locale === 'en-US' ? 'Mandatory Physical Documents in File' : 'Rol de Documentos Físicos Obrigatórios da Pasta'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Original Signed Power of Attorney' : 'Procuração Ad Judicia Original com Firma'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Signed Legal Fee Agreement' : 'Contrato de Honorários OAB Assinado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Copy of Client ID and Tax ID' : 'Cópia de RG e CPF do Segurado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Updated Proof of Residence' : 'Comprovante de Endereço Atualizado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Full CNIS Statement and Physical Work Card' : 'Extrato CNIS Integral e CTPS Física'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Rural Declaration or Documentary Evidence' : 'Autodeclaração Rural ou Provas e Laudos'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{locale === 'en-US' ? 'Filing Date:' : 'Data de Autuação:'} {todayFormatted}</span>
                  <span>{officeName} • {officeOab}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
