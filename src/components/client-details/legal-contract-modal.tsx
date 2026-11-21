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
  Layers,
  Eye,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { settingsStore } from '@/lib/data/mock-settings';
import type { Client } from '@/types/client';
import type { ContractTemplate, FeeModel, DocumentCategory } from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import {
  mergeTemplatePlaceholders,
  generateLawyerFeeClause,
  generateFeeInstallments,
} from '@/lib/utils/template-engine';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import {
  formatBenefitType,
  getCanonicalBenefitKey,
  formatDocumentCategory,
} from '@/lib/utils/benefit-translations';

const DEFAULT_POA_TEMPLATE = `PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: {{NOME_CLIENTE}}, brasileiro(a), {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, inscrito(a) no CPF/MF sob o nº {{CPF}}, portador(a) do RG nº {{RG}}, residente e domiciliado(a) em {{ENDERECO}}, telefone/WhatsApp: {{TELEFONE}}.

OUTORGADOS: Dr(a). {{NOME_ADVOGADO}}, advogado(a) inscrito(a) na Ordem dos Advogados do Brasil sob a {{OAB_ADVOGADO}}, bem como os advogados integrantes da sociedade {{NOME_ESCRITORIO}}, com endereço profissional onde recebem notificações, intimações e correspondências de estilo.

PODERES DA CLÁUSULA AD JUDICIA ET EXTRA:
Por este instrumento particular de procuração, o(a) Outorgante confere aos outorgados amplos e gerais poderes da cláusula ad judicia et extra para o foro em geral perante qualquer Juízo, Instância ou Tribunal, bem como perante autarquias públicas federais e estaduais, mormente o INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS), Conselho de Recursos da Previdência Social (CRPS), e Justiça Federal.

PODERES ESPECIAIS EXPRESSOS (ART. 105 DO CPC):
Confere ainda poderes especiais e expressos para requerer, desistir, transigir, acordar, anuir, firmar compromissos, receber citações e intimações, interpor recursos administrativos e judiciais, renunciar a valores excedentes ao teto dos Juizados Especiais Federais (quando conveniente ao processo), dar e receber quitação total ou parcial, e expressamente RECEBER E LEVANTAR ALVARÁS JUDICIAIS, PRECATÓRIOS E REQUISIÇÕES DE PEQUENO VALOR (RPV) perante a Caixa Econômica Federal e o Banco do Brasil S/A, retendo a cota-parte dos honorários advocatícios contratados, substabelecer com ou sem reserva de iguais poderes, dando tudo por bom, firme e valioso.

FINALIDADE ESPECÍFICA DO MANDATO:
A presente procuração destina-se especificamente ao pleito, concessão e liquidação do benefício previdenciário de {{BENEFICIO}} (Pasta Documental: {{PASTA_FISICA}}).`;

export interface ModalDocItem {
  id: string;
  templateId?: string;
  category: DocumentCategory | 'FOLDER_COVER';
  categoryLabel: string;
  title: string;
  description: string;
  content: string;
}

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
  const [selectedLawyer, setSelectedLawyer] = useState(() => lawyerOptions[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Contract & POA custom text bodies
  const [customBody, setCustomBody] = useState('');
  const [isContractEditedManually, setIsContractEditedManually] = useState(false);
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
  const [isDocsPanelOpen, setIsDocsPanelOpen] = useState(true);
  const [focusedDocId, setFocusedDocId] = useState<string>('contrato');
  const [isEditing, setIsEditing] = useState(false);
  const [customDocBodies, setCustomDocBodies] = useState<Record<string, string>>({});
  const [kitSelections, setKitSelections] = useState<Record<string, boolean>>({
    contrato: true,
    procuracao: true,
    capa: true,
  });

  const isDocIncludedInKit = (docId: string) => {
    if (kitSelections[docId] !== undefined) return kitSelections[docId];
    return docId === 'contrato' || docId === 'procuracao' || docId === 'capa';
  };

  const toggleKitItem = (docId: string) => {
    setKitSelections((prev) => ({
      ...prev,
      [docId]: !isDocIncludedInKit(docId),
    }));
  };

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

  const folderCoverBody = useMemo(() => {
    return `ETIQUETA E CAPA DE PRONTUÁRIO JURÍDICO — PREVIOFFICE

ESCRITÓRIO: ${officeName} (${officeOab})
CLIENTE: ${client.fullName}
CPF: ${maskCpf(client.cpf)} | RG: ${client.rg || 'Não informado'}
BENEFÍCIO REQUERIDO: ${formatBenefitType(client.benefitType, locale === 'en-US' ? 'en-US' : 'pt-BR')}
ADVOGADO RESPONSÁVEL: ${selectedLawyer.name} (${selectedLawyer.oab})
DATA DE CADASTRO: ${todayFormatted}

LOCALIZAÇÃO FÍSICA NO ARQUIVO:
${cabinetLocation}

DOCUMENTOS INTEGRANTES DESTE PRONTUÁRIO:
1. Instrumento Particular de Contrato de Honorários Advocatícios
2. Procuração Ad Judicia et Extra com Poderes para Recebimento de RPV
3. Declaração de Hipossuficiência Econômica (Gratuidade Judiciária)
4. Extratos do CNIS e Autodeclaração de Segurado Especial Rural
5. Comprovantes de Residência e Documentos Pessoais Autenticados`;
  }, [officeName, officeOab, client, selectedLawyer, todayFormatted, cabinetLocation, locale]);

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
    if (selectedTemplate && !isEditing && !isContractEditedManually) {
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
        clientAddress: fullAddress || 'Domiciliado(a) no Estado do Amazonas',
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
    isEditing,
    isContractEditedManually,
  ]);

  // Merge default POA with client data
  useEffect(() => {
    if (!isEditing && !isPoaEditedManually) {
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
        clientAddress: fullAddress || 'Domiciliado(a) no Estado do Amazonas',
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
  }, [selectedLawyer, client, fullAddress, cabinetLocation, todayFormatted, officeName, officeOab, selectedTemplate, isEditing, isPoaEditedManually, quotaLitisPercentage]);

  const availableDocuments = useMemo<ModalDocItem[]>(() => {
    const list: ModalDocItem[] = [];

    // 1. Contrato de Honorários Principal
    list.push({
      id: 'contrato',
      templateId: selectedTemplate?.id,
      category: 'FEE_CONTRACT',
      categoryLabel: 'Contrato de Honorários',
      title: selectedTemplate?.title || 'Contrato de Prestação de Serviços Advocatícios',
      description: 'Instrumento contratual principal com regime de honorários e cláusula de RPV/Precatório.',
      content: customBody,
    });

    // 2. Procuração Ad Judicia et Extra
    const poaTpl = templates.find((t) => t.documentCategory === 'POWER_OF_ATTORNEY' || t.id === 'tpl-005');
    list.push({
      id: 'procuracao',
      templateId: poaTpl?.id,
      category: 'POWER_OF_ATTORNEY',
      categoryLabel: 'Procuração Ad Judicia',
      title: poaTpl?.title || 'Procuração Ad Judicia et Extra (Previdenciária)',
      description: 'Poderes gerais para o foro e poderes expressos (Art. 105 CPC) para INSS e Justiça Federal.',
      content: customPoaBody,
    });

    // 3. Qualquer outro modelo cadastrado na Biblioteca de Minutas (Declarações, Renúncias, Requerimentos, etc.)
    const otherTemplates = templates.filter(
      (t) => t.id !== selectedTemplateId && t.id !== poaTpl?.id && t.documentCategory !== 'POWER_OF_ATTORNEY'
    );

    otherTemplates.forEach((t) => {
      const mergedContent = customDocBodies[t.id] ?? mergeTemplatePlaceholders(t.contentBody, {
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
        clientAddress: fullAddress || 'Domiciliado(a) no Estado do Amazonas',
        clientPhone: client.phone || 'Não informado',
        benefitSpecies: client.benefitType || t.benefitSpecies || 'Aposentadoria Previdenciária',
        feeDescription: generatedFeeClause,
        lawyerName: selectedLawyer.name,
        lawyerOab: selectedLawyer.oab,
        officeName,
        officeOab,
        cabinetFolder: cabinetLocation,
        fullDate: todayFormatted,
      });

      list.push({
        id: t.id,
        templateId: t.id,
        category: t.documentCategory || 'OTHER',
        categoryLabel: formatDocumentCategory(t.documentCategory, t.customCategoryName),
        title: t.title,
        description: t.description || `Minuta de ${formatDocumentCategory(t.documentCategory, t.customCategoryName)} cadastrada na biblioteca.`,
        content: mergedContent,
      });
    });

    // 4. Capa de Pasta Física (Etiqueta OAB)
    list.push({
      id: 'capa',
      category: 'FOLDER_COVER',
      categoryLabel: 'Identificação Física',
      title: 'Capa e Etiqueta de Pasta de Arquivo',
      description: 'Ficha catalográfica padronizada para colagem na pasta física do arquivo do escritório.',
      content: folderCoverBody,
    });

    return list;
  }, [
    selectedTemplate,
    selectedTemplateId,
    templates,
    customBody,
    customPoaBody,
    customDocBodies,
    client,
    fullAddress,
    generatedFeeClause,
    selectedLawyer,
    officeName,
    officeOab,
    cabinetLocation,
    todayFormatted,
    folderCoverBody,
  ]);

  const activeDoc = useMemo<ModalDocItem>(() => {
    return availableDocuments.find((d) => d.id === focusedDocId) || availableDocuments[0];
  }, [availableDocuments, focusedDocId]);

  const selectedKitCount = useMemo(() => {
    return availableDocuments.filter((d) => isDocIncludedInKit(d.id)).length;
  }, [availableDocuments, kitSelections]);

  const getCurrentDocContent = () => {
    if (focusedDocId === 'contrato') return customBody;
    if (focusedDocId === 'procuracao') return customPoaBody;
    if (focusedDocId === 'capa') return folderCoverBody;
    return customDocBodies[focusedDocId] ?? activeDoc.content;
  };

  const handleSetCurrentDocContent = (val: string) => {
    if (focusedDocId === 'contrato') {
      setCustomBody(val);
      setIsContractEditedManually(true);
    } else if (focusedDocId === 'procuracao') {
      setCustomPoaBody(val);
      setIsPoaEditedManually(true);
    } else if (focusedDocId !== 'capa') {
      setCustomDocBodies((prev) => ({ ...prev, [focusedDocId]: val }));
    }
  };

  const handleSelectDoc = (docId: string) => {
    setFocusedDocId(docId);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  const handleLawyerChange = (name: string) => {
    const l = lawyerOptions.find((opt) => opt.name === name) || lawyerOptions[0];
    setSelectedLawyer(l);
    setIsEditing(false);

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
    setFocusedDocId('contrato');
    setIsEditing(false);
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
    setIsEditing(false);
    setFocusedDocId('contrato');
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
      clientAddress: fullAddress || 'Domiciliado(a) no Estado do Amazonas',
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
    const textToCopy = getCurrentDocContent();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High-fidelity isolated A4 print
  const handlePrint = () => {
    if (isEditing) {
      setIsEditing(false);
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
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-[99vw] 2xl:max-w-[1540px] h-[96vh] max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
            {/* Desktop Sidebar 1: Parâmetros Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-[#C89543]/20 hover:bg-[#C89543]/30 text-[#C89543] border-[#C89543]/40'
              }`}
              title={isSidebarOpen ? 'Ocultar Parâmetros' : 'Mostrar Parâmetros'}
            >
              {isSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Ocultar Parâmetros</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Mostrar Parâmetros</span>
                </>
              )}
            </button>

            {/* Desktop Sidebar 2: Documentos da Minuta Toggle */}
            <button
              type="button"
              onClick={() => setIsDocsPanelOpen(!isDocsPanelOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDocsPanelOpen
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-[#C89543]/20 hover:bg-[#C89543]/30 text-[#C89543] border-[#C89543]/40'
              }`}
              title={isDocsPanelOpen ? 'Ocultar Documentos' : 'Mostrar Documentos'}
            >
              <Layers className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{isDocsPanelOpen ? `Ocultar Documentos (${availableDocuments.length})` : `Documentos (${availableDocuments.length})`}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar"
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area (3 Colunas Ocultáveis de Forma Independente) */}
        <div className="flex-1 min-h-0 flex flex-row overflow-x-auto overflow-y-hidden">
          {/* ========================================================================= */}
          {/* COLUNA 1: Painel Lateral de Configurações & Parâmetros (Aba 1)             */}
          {/* ========================================================================= */}
          {isSidebarOpen && (
            <aside className="w-72 sm:w-80 lg:w-88 shrink-0 bg-[#0B192E] border-r border-white/10 flex flex-col h-full overflow-hidden transition-all duration-200">
              {/* Header do Cliente */}
              <div className="p-4 border-b border-white/10 bg-slate-900/60 shrink-0">
                <span className="text-[10px] font-bold text-[#C89543] uppercase tracking-wider block mb-1">
                  Cliente em Atendimento
                </span>
                <h2 className="text-sm font-bold text-white leading-tight">{client.fullName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  CPF: {maskCpf(client.cpf)} • {formatBenefitType(client.benefitType, locale === 'en-US' ? 'en-US' : 'pt-BR')}
                </p>
                <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cabinetLocation}</span>
                </div>
              </div>

              {/* Configuração de Minutas e Honorários */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Escolha do Advogado */}
                <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-[#C89543] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
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

                {/* Escolha do Contrato Base */}
                <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-white/10">
                  <label className="block text-[10px] font-bold uppercase text-[#C89543] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Minuta Contratual Base</span>
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.isDefault ? '★ [Padrão] ' : ''}
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Regime de Honorários */}
                <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-300 block">
                      Regime de Remuneração
                    </span>
                    {appliedFeeFeedback && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        ✓ Atualizado!
                      </span>
                    )}
                  </div>
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
                      <div className="text-xs">Quota Litis</div>
                      <div className="text-[10px] opacity-75">Êxito puro</div>
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
                      <div className="text-xs">Parcelado</div>
                      <div className="text-[10px] opacity-75">Carnê</div>
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
                      <div className="text-xs">Híbrido</div>
                      <div className="text-[10px] opacity-75">Entrada+Êxito</div>
                    </button>
                  </div>

                  {feeModel !== 'FIXED_INSTALLMENT' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Percentual Êxito:</span>
                        <span className="font-bold text-[#C89543] text-sm">{quotaLitisPercentage}%</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Percentual de Êxito"
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

                  {feeModel !== 'QUOTA_LITIS' && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Valor Fixo:</span>
                          <input
                            type="number"
                            step={100}
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(Number(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
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
                            className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyFeeRegime}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C89543] hover:bg-[#b07d32] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar Cláusula na Folha (OK)</span>
                  </button>
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

              {/* Rodapé da Coluna Esquerda */}
              <div className="p-3 bg-slate-900 border-t border-white/10 shrink-0 space-y-2">
                <button
                  type="button"
                  onClick={handleFormalizeAndSaveContract}
                  disabled={isFormSaved}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#168447] hover:bg-[#126b39] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFormSaved ? 'Formalizado com Sucesso!' : `Formalizar Kit Completo (${selectedKitCount})`}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#082A52] hover:bg-[#0c396d] text-white text-xs font-bold border border-[#C89543]/40 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4 text-[#C89543]" />
                  <span>Imprimir Documentos Selecionados</span>
                </button>
              </div>
            </aside>
          )}

          {/* ========================================================================= */}
          {/* COLUNA 2: Documentos Vinculados à Minuta (Aba 2 - Arquivo)                 */}
          {/* ========================================================================= */}
          {isDocsPanelOpen && (
            <aside className="w-72 sm:w-84 lg:w-96 shrink-0 bg-slate-900 border-r border-slate-700 flex flex-col h-full overflow-hidden transition-all duration-200">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Layers className="w-4 h-4 text-[#C89543]" />
                  <span>Documentos Vinculados à Minuta</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                  {availableDocuments.length} disponíveis
                </span>
              </div>

              {/* Lista Vertical com Cartões de cada documento (Idêntica à Imagem 2) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
                {availableDocuments.map((doc, idx) => {
                  const isActive = doc.id === focusedDocId;
                  const isChecked = isDocIncludedInKit(doc.id);
                  return (
                    <div
                      key={doc.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectDoc(doc.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectDoc(doc.id);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#C89543] ${
                        isActive
                          ? 'bg-[#082A52] border-[#C89543] shadow-md ring-2 ring-[#C89543]/30'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            aria-label={`Incluir ${doc.title} no kit de emissão`}
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
                          {isChecked ? '✓ No kit de emissão' : '○ Não incluído'}
                        </span>
                        {doc.id !== 'capa' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDoc(doc.id);
                              setIsEditing(true);
                            }}
                            className="text-[#C89543] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar texto</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

          {/* ========================================================================= */}
          {/* COLUNA 3: Folha A4 Central em Foco (Aba o Documento)                      */}
          {/* ========================================================================= */}
          <main className="flex-1 min-w-[500px] flex flex-col bg-slate-300/80 h-full overflow-hidden">
            {/* Barra de Ações Rápidas da Folha */}
            <div className="bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#082A52] text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#C89543]" />
                  <span>Visualizando: {activeDoc.title}</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  {activeDoc.categoryLabel}
                </span>

                {/* Seletor rápido quando o painel de documentos estiver oculto */}
                {!isDocsPanelOpen && (
                  <select
                    value={focusedDocId}
                    onChange={(e) => handleSelectDoc(e.target.value)}
                    aria-label="Alternar documento visualizado"
                    className="ml-2 bg-slate-100 text-[#082A52] border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C89543] cursor-pointer"
                    title="Alternar documento visualizado"
                  >
                    {availableDocuments.map((doc, idx) => (
                      <option key={doc.id} value={doc.id}>
                        {idx + 1}. {doc.categoryLabel} - {doc.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                {focusedDocId !== 'capa' && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Concluir Edição' : 'Editar Cláusulas'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
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
                id="client-contract-printable-area"
                className="bg-white w-full max-w-[800px] min-h-[1130px] shadow-2xl rounded-xs border border-slate-300 p-10 sm:p-14 text-slate-900 text-xs sm:text-sm leading-relaxed flex flex-col justify-between shrink-0 mb-12"
              >
                {isEditing ? (
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900">
                      <span className="font-bold">Modo de Edição Livre Ativo</span>
                      <span>As alterações serão salvas neste documento</span>
                    </div>
                    <textarea
                      rows={28}
                      aria-label="Editor de texto livre do documento"
                      value={getCurrentDocContent()}
                      onChange={(e) => handleSetCurrentDocContent(e.target.value)}
                      className="w-full min-h-[850px] p-4 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B78D0] text-slate-800 leading-relaxed"
                    />
                  </div>
                ) : (
                  <>
                    {/* Rendered Document View based on focusedDocId */}
                    {focusedDocId === 'contrato' && (
                      <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-center border-b-2 border-[#082A52] pb-4 mb-5">
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              {officeName} • {officeOab}
                            </div>
                            <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1 tracking-tight">
                              Contrato de Prestação de Serviços Advocatícios e Honorários
                            </h2>
                            <div className="text-xs text-[#C89543] font-bold mt-0.5">
                              {selectedTemplate?.title || 'Contrato de Honorários'}
                            </div>
                          </div>

                          <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {customBody}
                          </div>
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

                    {focusedDocId === 'procuracao' && (
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

                          <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {customPoaBody}
                          </div>
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

                    {focusedDocId === 'capa' && (
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

                    {focusedDocId !== 'contrato' && focusedDocId !== 'procuracao' && focusedDocId !== 'capa' && (
                      <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-center border-b-2 border-[#082A52] pb-4 mb-5">
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              {officeName} • {officeOab}
                            </div>
                            <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1 tracking-tight">
                              {activeDoc.title}
                            </h2>
                            <div className="text-xs text-[#C89543] font-bold mt-0.5">
                              {activeDoc.categoryLabel}
                            </div>
                          </div>

                          <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {customDocBodies[activeDoc.id] ?? activeDoc.content}
                          </div>
                        </div>

                        {/* Bloco de Assinaturas e Testemunhas */}
                        <div className="pt-8 space-y-8 break-inside-avoid text-xs">
                          <div className="text-right text-slate-600">
                            {locale === 'en-US' ? `Location, ${todayFormatted}.` : `Localidade, ${todayFormatted}.`}
                          </div>

                          <div className="grid grid-cols-2 gap-8 text-center pt-2">
                            <div className="border-t border-slate-800 pt-1.5">
                              <strong className="block text-slate-900">{client.fullName}</strong>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {locale === 'en-US' ? 'PRINCIPAL' : 'REQUERENTE / DECLARANTE'} • {locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} {maskCpf(client.cpf)}
                              </span>
                            </div>

                            <div className="border-t border-slate-800 pt-1.5">
                              <strong className="block text-slate-900">{selectedLawyer.name}</strong>
                              <span className="text-[11px] text-slate-500">
                                {selectedLawyer.oab} • {officeName}
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
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
