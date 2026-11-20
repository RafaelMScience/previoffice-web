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
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import type { Client } from '@/types/client';
import type { ContractTemplate } from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import { mergeTemplatePlaceholders } from '@/lib/utils/template-engine';
import { maskCpf, maskPhone } from '@/lib/utils/masks';

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
  const { t } = useI18n();
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
  const [isEditingCustomBody, setIsEditingCustomBody] = useState(false);
  const [customBody, setCustomBody] = useState('');
  const [quotaLitisPercentage, setQuotaLitisPercentage] = useState(30);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      const allTemplates = contractsStore.getTemplates();
      setTemplates(allTemplates);

      // Auto-select template matching lawyer or client benefit
      const matchingLawyerTpl = allTemplates.find(
        (tpl) => tpl.lawyerName === selectedLawyer.name && tpl.isDefault
      );
      const matchingBenefitTpl = allTemplates.find(
        (tpl) =>
          client.benefitType &&
          tpl.benefitSpecies.toLowerCase().includes(client.benefitType.toLowerCase())
      );
      const defaultTpl = matchingLawyerTpl || matchingBenefitTpl || allTemplates[0];

      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
        if (defaultTpl.defaultQuotaLitisPercentage) {
          setQuotaLitisPercentage(defaultTpl.defaultQuotaLitisPercentage);
        }
      }
    }
  }, [isOpen, client.benefitType, selectedLawyer.name]);

  const selectedTemplate = useMemo(() => {
    return templates.find((tpl) => tpl.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const fullAddress = useMemo(() => {
    return [
      client.street,
      client.streetNumber ? `nº ${client.streetNumber}` : 'S/N',
      client.complement,
      client.neighborhood,
      client.city ? `${client.city} - ${client.state || 'PB'}` : '',
      client.postalCode ? `CEP: ${client.postalCode}` : '',
    ]
      .filter(Boolean)
      .join(', ');
  }, [client]);

  const cabinetLocation = useMemo(() => {
    return client.physicalFileLocation || 'Armário Geral do Escritório';
  }, [client]);

  // Merge template with client data whenever template, lawyer or percentage changes
  useEffect(() => {
    if (selectedTemplate && !isEditingCustomBody) {
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
        clientProfession: client.profession || 'Agricultora / Lavradora',
        clientAddress: fullAddress || 'Domiciliado(a) no Estado da Paraíba',
        clientPhone: client.phone || 'Não informado',
        benefitSpecies: client.benefitType || selectedTemplate.benefitSpecies || 'Aposentadoria Previdenciária',
        feeDescription: `${quotaLitisPercentage}% (${quotaLitisPercentage} por cento) sobre a totalidade dos valores atrasados apurados da DER à implantação`,
        lawyerName: selectedLawyer.name,
        lawyerOab: selectedLawyer.oab,
        cabinetFolder: cabinetLocation,
        fullDate: todayFormatted,
      });
      setCustomBody(merged);
    }
  }, [selectedTemplate, selectedLawyer, quotaLitisPercentage, client, fullAddress, cabinetLocation, todayFormatted, isEditingCustomBody]);

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
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      if (tpl.defaultQuotaLitisPercentage) {
        setQuotaLitisPercentage(tpl.defaultQuotaLitisPercentage);
      }
      if (tpl.lawyerName) {
        const matchingLawyer = lawyerOptions.find((l) => l.name === tpl.lawyerName);
        if (matchingLawyer) setSelectedLawyer(matchingLawyer);
      }
    }
  };

  const handleCopyText = () => {
    const printableArea = document.getElementById('client-contract-printable-area');
    const text = printableArea ? printableArea.innerText : customBody;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High-fidelity isolated A4 print
  const handlePrint = () => {
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
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Documento Oficial OAB - ${client.fullName}</title>
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

  const handleFormalizeAndSaveContract = () => {
    const contractNumber = `CTR-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

    contractsStore.createContract({
      tenantId: 'tenant-001',
      clientId: client.id,
      clientName: client.fullName,
      clientCpf: client.cpf ? maskCpf(client.cpf) : 'Não informado',
      clientPhone: client.mobilePhone || client.phone ? maskPhone(client.mobilePhone || client.phone) : undefined,
      contractNumber,
      templateId: selectedTemplate?.id,
      templateTitle: selectedTemplate?.title,
      benefitSpecies: client.benefitType || 'Aposentadoria Previdenciária',
      status: 'ACTIVE',
      feeStructure: {
        feeModel: selectedTemplate?.defaultFeeModel || 'QUOTA_LITIS',
        quotaLitisPercentage,
        estimatedRetroactiveAmount: 36000,
        estimatedSuccessFeeAmount: (36000 * quotaLitisPercentage) / 100,
        installments: [],
      },
      physicalSignedStatus: 'PENDING',
      lawyerName: selectedLawyer.name,
      lawyerOab: selectedLawyer.oab,
      officeName: 'Alexandre Pontes Sociedade de Advogados',
      issuedAt: new Date().toISOString(),
      physicalFileLocation: cabinetLocation,
    });

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Screen only */}
        <div className="bg-[#0B192E] text-white p-5 sm:p-6 relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <FileSignature className="w-4 h-4" />
            <span>Emissão Oficial de Procuração e Contrato OAB</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {client.fullName}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            CPF: {maskCpf(client.cpf)} • {client.benefitType || 'Benefício Previdenciário'} • Pasta: {cabinetLocation}
          </p>

          {/* Configuration Controls Strip */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Lawyer Selector */}
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

            {/* Template Selector */}
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

            {/* Fee percentage */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#C89543] mb-1">
                Percentual de Êxito (Quota Litis)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={quotaLitisPercentage}
                  onChange={(e) => {
                    setQuotaLitisPercentage(Number(e.target.value));
                    setIsEditingCustomBody(false);
                  }}
                  className="w-20 bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                />
                <span className="text-xs text-slate-300 font-semibold">% s/ atrasados</span>
              </div>
            </div>
          </div>

          {/* Doc Switcher Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedDoc('contrato')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedDoc === 'contrato'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Contrato de Honorários OAB</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDoc('procuracao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedDoc === 'procuracao'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Procuração Ad Judicia et Extra</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDoc('capa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedDoc === 'capa'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>3. Capa de Pasta Física</span>
            </button>
          </div>
        </div>

        {/* Paper Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center">
          <div
            id="client-contract-printable-area"
            className="bg-white w-full max-w-[720px] shadow-xl rounded-sm border border-slate-300 p-8 sm:p-12 text-slate-900 text-xs sm:text-sm leading-relaxed space-y-4"
          >
            {/* DOCUMENT 1: CONTRATO DE HONORÁRIOS */}
            {selectedDoc === 'contrato' && (
              <div className="space-y-4 text-justify">
                {/* Header */}
                <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Alexandre Pontes Sociedade de Advogados • OAB/PB
                  </div>
                  <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
                    Contrato de Prestação de Serviços Advocatícios e Honorários
                  </h2>
                  <div className="text-xs text-[#C89543] font-bold mt-0.5">
                    Patrocínio: {selectedLawyer.name} ({selectedLawyer.oab})
                  </div>
                </div>

                {/* Edit inline toggle */}
                <div className="print:hidden flex justify-end pb-1">
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
                      rows={14}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B78D0]"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {customBody}
                  </div>
                )}

                {/* Signatures */}
                <div className="pt-8 space-y-8 break-inside-avoid text-xs">
                  <div className="text-right text-slate-600">
                    Localidade, {todayFormatted}.
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-center pt-2">
                    <div className="border-t border-slate-800 pt-1.5">
                      <strong className="block text-slate-900">{client.fullName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">CONTRATANTE • CPF: {maskCpf(client.cpf)}</span>
                    </div>

                    <div className="border-t border-slate-800 pt-1.5">
                      <strong className="block text-slate-900">{selectedLawyer.name}</strong>
                      <span className="text-[11px] text-slate-500">{selectedLawyer.oab} • CONTRATADA</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
                    <div className="border-t border-slate-400 pt-1">
                      <span>1ª Testemunha / A Rogo:</span><br />
                      <span>Nome: ____________________________________</span><br />
                      <span>CPF: _____________________________________</span>
                    </div>

                    <div className="border-t border-slate-400 pt-1">
                      <span>2ª Testemunha Instrumentária:</span><br />
                      <span>Nome: ____________________________________</span><br />
                      <span>CPF: _____________________________________</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 2: PROCURAÇÃO AD JUDICIA */}
            {selectedDoc === 'procuracao' && (
              <div className="space-y-4 text-justify">
                <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Poder Judiciário • Instituto Nacional do Seguro Social
                  </div>
                  <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
                    Procuração Ad Judicia et Extra
                  </h2>
                  <div className="text-xs text-[#168447] font-bold mt-0.5">
                    Representação Previdenciária e Processual (Art. 105 CPC)
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                  <p>
                    <strong>OUTORGANTE:</strong> <strong>{client.fullName}</strong>, brasileiro(a), inscrito(a) no Cadastro de Pessoas Físicas (CPF/MF) sob o nº <span className="font-mono font-bold">{maskCpf(client.cpf)}</span>, RG nº {client.rg || 'Não informado'}, residente e domiciliado(a) em {fullAddress || 'Domicílio nesta comarca'}.
                  </p>

                  <p>
                    <strong>OUTORGADOS:</strong> <strong>{selectedLawyer.name}</strong>, advogado inscrito na Ordem dos Advogados do Brasil sob a <strong>{selectedLawyer.oab}</strong>, bem como os advogados integrantes da sociedade <strong>ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS</strong>, com endereço profissional onde recebem notificações e intimações de estilo.
                  </p>

                  <div>
                    <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                      PODERES DA CLÁUSULA AD JUDICIA ET EXTRA
                    </h3>
                    <p className="mt-0.5">
                      Por este instrumento particular de procuração, o(a) Outorgante confere aos outorgados amplos e gerais poderes da cláusula <em>ad judicia et extra</em> para o foro em geral perante qualquer Juízo, Instância ou Tribunal, bem como perante autarquias públicas federais e estaduais, mormente o <strong>INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS)</strong>, CRPS, e Justiça Federal.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                      PODERES ESPECIAIS EXPRESSOS (ART. 105 DO CPC)
                    </h3>
                    <p className="mt-0.5">
                      Confere ainda poderes especiais e expressos para requerer, desistir, transigir, acordar, anuir, firmar compromissos, receber citações e intimações, interpor recursos administrativos e judiciais, renunciar a valores excedentes ao teto dos Juizados Especiais Federais (quando conveniente ao processo), dar e receber quitação total ou parcial, e expressamente <strong>RECEBER E LEVANTAR ALVARÁS JUDICIAIS, PRECATÓRIOS E REQUISIÇÕES DE PEQUENO VALOR (RPV)</strong> perante a Caixa Econômica Federal e o Banco do Brasil S/A, retendo a cota-parte dos honorários advocatícios contratados, substabelecer com ou sem reserva de iguais poderes, dando tudo por bom, firme e valioso.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                      FINALIDADE ESPECÍFICA DO MANDATO
                    </h3>
                    <p className="mt-0.5">
                      A presente procuração destina-se especificamente ao pleito, concessão e liquidação do benefício previdenciário de <strong>{client.benefitType || selectedTemplate?.benefitSpecies || 'Aposentadoria Previdenciária'}</strong> (Pasta: {cabinetLocation}).
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-8 space-y-8 break-inside-avoid text-xs">
                  <div className="text-right text-slate-600">
                    Localidade, {todayFormatted}.
                  </div>

                  <div className="max-w-xs mx-auto border-t border-slate-800 pt-2 text-center">
                    <strong className="block text-slate-900">{client.fullName}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">OUTORGANTE • CPF: {maskCpf(client.cpf)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
                    <div className="border-t border-slate-400 pt-1">
                      <span>Assinatura a Rogo (caso analfabeto):</span><br />
                      <span>Nome: ____________________________________</span><br />
                      <span>CPF: _____________________________________</span>
                    </div>

                    <div className="border-t border-slate-400 pt-1">
                      <span>Testemunha Instrumentária:</span><br />
                      <span>Nome: ____________________________________</span><br />
                      <span>CPF: _____________________________________</span>
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
                    <span className="font-bold uppercase tracking-wider text-xs">Alexandre Pontes Sociedade de Advogados</span>
                  </div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-[#082A52] uppercase tracking-tight">
                    Dossiê do Processo Previdenciário
                  </h2>
                  <div className="text-xs text-[#C89543] font-bold uppercase tracking-widest mt-0.5">
                    Arquivo Físico Central • Gestão Documental OAB
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Identificação da Pasta
                    </span>
                    <div className="text-2xl font-mono font-extrabold text-[#082A52]">
                      {client.physicalFileLocation || 'PASTA 2026-PEND'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Armário & Gaveta
                    </span>
                    <div className="text-sm font-bold text-[#C89543]">
                      {cabinetLocation}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
                    Dados Cadastrais do Segurado(a)
                  </h3>
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium w-40">Nome Completo:</td>
                        <td className="py-1.5 font-bold text-slate-900">{client.fullName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">CPF do Segurado:</td>
                        <td className="py-1.5 font-mono font-bold text-slate-900">{maskCpf(client.cpf)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">Espécie / Objeto:</td>
                        <td className="py-1.5 font-bold text-[#082A52]">{client.benefitType || 'Previdenciário'}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">Advogado Patrono:</td>
                        <td className="py-1.5 text-slate-800 font-semibold">{selectedLawyer.name} ({selectedLawyer.oab})</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">Telefone de Contato:</td>
                        <td className="py-1.5 text-slate-800">{client.phone || 'Não informado'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
                    Rol de Documentos Físicos Obrigatórios da Pasta
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>Procuração Ad Judicia Original com Firma</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>Contrato de Honorários OAB Assinado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>Cópia de RG e CPF do Segurado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>Comprovante de Endereço Atualizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>Extrato CNIS Integral e CTPS Física</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>Autodeclaração Rural / Provas ou Laudos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Data de Autuação: {todayFormatted}</span>
                  <span>Alexandre Pontes Advogados • OAB/PB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-[#C89543]" />
              <span>Imprimir em Folha A4</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleFormalizeAndSaveContract}
              disabled={isFormSaved}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#168447] hover:bg-[#126b39] text-white text-xs font-bold shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFormSaved ? 'Formalizado com Sucesso!' : 'Formalizar e Registrar no Hub'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
