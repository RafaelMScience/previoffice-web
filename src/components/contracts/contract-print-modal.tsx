'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  ShieldCheck,
  FolderLock,
  Copy,
  Check,
  Scale,
  CheckCircle2,
  ExternalLink,
  Eye,
  Clock,
} from 'lucide-react';
import type { Contract } from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import { formatDatePtBR } from '@/lib/utils/template-engine';

interface ContractPrintModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

type DocumentViewType = 'CONTRACT' | 'POA' | 'FOLDER_COVER';

export function ContractPrintModal({ contract, isOpen, onClose }: ContractPrintModalProps) {
  const { t, locale } = useI18n();
  const [docType, setDocType] = useState<DocumentViewType>('CONTRACT');
  const [copied, setCopied] = useState(false);
  const [viewCustomPdf, setViewCustomPdf] = useState(true);

  if (!isOpen || !contract) return null;

  // Detect custom uploaded PDF documents
  const customContractDoc =
    contract.customContractAttachment ||
    (contract.physicalAttachment?.documentCategory === 'FEE_CONTRACT'
      ? contract.physicalAttachment
      : undefined);

  const customPoaDoc =
    contract.customPoaAttachment ||
    (contract.physicalAttachment?.documentCategory === 'POWER_OF_ATTORNEY'
      ? contract.physicalAttachment
      : undefined);

  const activeCustomDoc =
    docType === 'CONTRACT' ? customContractDoc : docType === 'POA' ? customPoaDoc : undefined;

  const hasActiveCustomPdf = Boolean(activeCustomDoc?.fileDataUrl);

  const formatBRL = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getFullTodayDate = () => {
    return new Intl.DateTimeFormat(locale === 'en-US' ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  };

  const handleCopyText = () => {
    const printableArea = document.getElementById('contract-printable-sheet');
    const text = printableArea ? printableArea.innerText : '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintDocument = () => {
    // If viewing an active custom PDF, print the PDF directly with safety checks
    if (
      hasActiveCustomPdf &&
      viewCustomPdf &&
      activeCustomDoc?.fileDataUrl &&
      (activeCustomDoc.fileDataUrl.startsWith('data:application/pdf') ||
        activeCustomDoc.fileDataUrl.startsWith('blob:'))
    ) {
      const iframe = document.createElement('iframe');
      iframe.setAttribute(
        'style',
        'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;'
      );
      iframe.src = activeCustomDoc.fileDataUrl;
      document.body.appendChild(iframe);

      const cleanup = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      };

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(activeCustomDoc.fileDataUrl, '_blank')?.print();
        }
        setTimeout(cleanup, 2000);
      };
      // Fallback cleanup if onload does not trigger
      setTimeout(cleanup, 5000);
      return;
    }

    const printableArea = document.getElementById('contract-printable-sheet');
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
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.print();
      return;
    }

    // Capture active CSS styles and link tags from page
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    const docTitle =
      locale === 'en-US'
        ? docType === 'CONTRACT'
          ? `Legal Fee Agreement - ${contract.clientName} - ${contract.contractNumber}`
          : docType === 'POA'
          ? `Power of Attorney - ${contract.clientName}`
          : `Physical Folder Cover - ${contract.clientName}`
        : docType === 'CONTRACT'
        ? `Contrato de Honorários - ${contract.clientName} - ${contract.contractNumber}`
        : docType === 'POA'
        ? `Procuração Ad Judicia - ${contract.clientName}`
        : `Capa de Pasta Física - ${contract.clientName}`;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="${locale === 'en-US' ? 'en-US' : 'pt-BR'}">
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
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
              font-size: 10pt !important;
              line-height: 1.5 !important;
            }
            .a4-print-container {
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
          <div class="a4-print-container">
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

  const quotaLitis = contract.feeStructure.quotaLitisPercentage || 30;
  const fixedTotal = contract.feeStructure.fixedTotalAmount || 0;
  const installments = contract.feeStructure.installments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#082A52] text-[#C89543] rounded-xl shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#082A52]">
                {t.contracts.modalPrintTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {contract.contractNumber} • {contract.clientName} ({formatBenefitType(contract.benefitSpecies, locale === 'en-US' ? 'en-US' : 'pt-BR')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(!hasActiveCustomPdf || !viewCustomPdf) && (
              <button
                type="button"
                onClick={handleCopyText}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintDocument}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-md transition-all border border-[#C89543]/40"
            >
              <Printer className="w-4 h-4 text-[#C89543]" />
              <span>
                {hasActiveCustomPdf && viewCustomPdf
                  ? 'Imprimir PDF Personalizado'
                  : 'Imprimir Documento (A4)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Selection Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDocType('CONTRACT');
                setViewCustomPdf(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                docType === 'CONTRACT'
                  ? 'border-[#082A52] text-[#082A52]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-[#C89543]" />
              <span>1. Contrato de Honorários OAB</span>
              {customContractDoc?.fileDataUrl && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PDF Vinculado
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setDocType('POA');
                setViewCustomPdf(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                docType === 'POA'
                  ? 'border-[#082A52] text-[#082A52]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Procuração Ad Judicia et Extra</span>
              {customPoaDoc?.fileDataUrl && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PDF Vinculado
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDocType('FOLDER_COVER')}
              className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                docType === 'FOLDER_COVER'
                  ? 'border-[#082A52] text-[#082A52]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderLock className="w-4 h-4 text-amber-600" />
              <span>3. Capa de Pasta Física (Arquivo)</span>
            </button>
          </div>

          {/* Toggle button when custom PDF is available */}
          {hasActiveCustomPdf && (
            <button
              type="button"
              onClick={() => setViewCustomPdf(!viewCustomPdf)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors shrink-0 mb-1"
            >
              <Eye className="w-3.5 h-3.5 text-[#0B78D0]" />
              <span>
                {viewCustomPdf ? 'Visualizar Minuta Padrão do Sistema' : 'Visualizar PDF do Escritório'}
              </span>
            </button>
          )}
        </div>

        {/* Paper Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-300/60 flex justify-center items-start">
          {hasActiveCustomPdf && viewCustomPdf && activeCustomDoc?.fileDataUrl ? (
            <div className="w-full max-w-[850px] space-y-3">
              {/* Audit Banner */}
              <div
                className={`p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  activeCustomDoc.isSigned
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {activeCustomDoc.isSigned ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Documento Assinado pelo Cliente (Padrão Ativo Oficial)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                        Minuta Própria do Escritório (Pendente de Assinatura)
                      </span>
                    )}
                    <span className="text-xs font-bold">
                      {docType === 'CONTRACT' ? 'Contrato de Honorários' : 'Procuração Ad Judicia'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Arquivo: <strong>{activeCustomDoc.fileName}</strong> ({activeCustomDoc.fileSizeFormatted}) • 
                    Substituído por: <strong>{activeCustomDoc.replacedBy || activeCustomDoc.uploadedBy}</strong> em{' '}
                    {formatDatePtBR(activeCustomDoc.replacedAt || activeCustomDoc.uploadedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeCustomDoc.fileDataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#0B78D0]" />
                    <span>Abrir em Nova Aba</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF container */}
              <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden min-h-[780px]">
                {activeCustomDoc.fileDataUrl.startsWith('data:application/pdf') ||
                activeCustomDoc.fileDataUrl.startsWith('blob:') ? (
                  <iframe
                    src={activeCustomDoc.fileDataUrl}
                    title="PDF Personalizado do Escritório"
                    className="w-full h-[780px] border-none"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Arquivo não compatível com visualizador embutido. Clique em "Abrir em Nova Aba".
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              id="contract-printable-sheet"
              className="bg-white w-full max-w-[794px] min-h-[1123px] h-auto shadow-2xl rounded-xs border border-slate-300 p-8 sm:p-14 md:p-16 text-slate-900 text-xs sm:text-sm leading-relaxed space-y-6 flex flex-col justify-between shrink-0 mb-8"
            >
            {/* DOCUMENT 1: CONTRACT */}
            {docType === 'CONTRACT' && (
              <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
                <div>
                  {/* Office Header */}
                  <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {contract.officeName || 'Alexandre Pontes Sociedade de Advogados'} • OAB
                    </div>
                    <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
                      Contrato de Prestação de Serviços Advocatícios e Honorários
                    </h2>
                    <div className="text-xs text-[#C89543] font-bold mt-0.5">
                      Instrumento Particular Nº {contract.contractNumber} • {formatBenefitType(contract.benefitSpecies, locale === 'en-US' ? 'en-US' : 'pt-BR')}
                    </div>
                  </div>

                  {contract.customContractBody ? (
                    <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {contract.customContractBody}
                    </div>
                  ) : (
                    <>
                      {/* Qualification */}
                      <div className="space-y-2 text-xs leading-relaxed text-slate-800">
                        <p>
                          <strong>CONTRATANTE:</strong> <strong>{contract.clientName}</strong>, inscrito(a) no CPF/MF sob o nº{' '}
                          <span className="font-mono font-bold">{contract.clientCpf}</span>, telefone{' '}
                          <span>{contract.clientPhone || 'Não informado'}</span>, domiciliado(a) no Estado da Paraíba, doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.
                        </p>

                        <p>
                          <strong>CONTRATADA:</strong> <strong>{contract.officeName ? contract.officeName.toUpperCase() : 'ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS'}</strong>, pessoa jurídica de direito privado inscrita na OAB sob o registro competente, representada pelo advogado <strong>{contract.lawyerName || 'Dr. Alexandre Pontes'}</strong>, inscrito na <strong>{contract.lawyerOab || 'OAB/AM 55.858'}</strong>, com sede e escritório profissional estabelecido nesta comarca, doravante denominada simplesmente <strong>CONTRATADA</strong>.
                        </p>
                      </div>

                      {/* Clauses */}
                      <div className="space-y-3 pt-2 text-xs leading-relaxed text-slate-800">
                        <div>
                          <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                            CLÁUSULA PRIMEIRA — DO OBJETO E PATROCÍNIO
                          </h3>
                          <p className="mt-0.5">
                            O presente instrumento tem por objeto a prestação de serviços jurídicos e assessoria contenciosa pela CONTRATADA em favor do CONTRATANTE, visando ao requerimento, postulação administrativa perante o <strong>INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS)</strong> e, se necessário, o ajuizamento de competente Ação Previdenciária perante a Justiça Federal ou Estadual, com vistas à concessão e liquidação do benefício de <strong>{formatBenefitType(contract.benefitSpecies, 'pt-BR')}</strong>.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                            CLÁUSULA SEGUNDA — DOS HONORÁRIOS ADVOCATÍCIOS CONTRATUAIS
                          </h3>
                          {contract.feeStructure.feeModel === 'QUOTA_LITIS' && (
                            <p className="mt-0.5">
                              Em remuneração pelos serviços ora pactuados, o CONTRATANTE pagará à CONTRATADA honorários advocatícios <em>ad exitum</em> (Quota Litis) no percentual de <strong>{quotaLitis}% ({quotaLitis} por cento)</strong> incidentes sobre a totalidade do proveito econômico auferido na causa, correspondente ao montante dos valores retroativos apurados desde a Data de Entrada do Requerimento (DER) até a efetiva implantação do benefício previdenciário pelo INSS.
                            </p>
                          )}

                          {contract.feeStructure.feeModel === 'FIXED_INSTALLMENT' && (
                            <div className="mt-0.5 space-y-1">
                              <p>
                                Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA a quantia líquida e certa de <strong>{formatBRL(fixedTotal)}</strong>, parcelada em <strong>{contract.feeStructure.installmentCount || installments.length || 1} prestação(ões) mensal(is)</strong> de {formatBRL(installments[0]?.amount || (fixedTotal / (contract.feeStructure.installmentCount || installments.length || 1)))}, devidamente registradas e solvidas conforme o seguinte cronograma:
                              </p>
                              {installments.length > 0 && (
                                <div className="pl-3 py-1 space-y-0.5 font-mono text-[11px] text-slate-700">
                                  {installments.map((inst) => (
                                    <div key={inst.id || inst.installmentNumber}>
                                      • Parcela {inst.installmentNumber}/{contract.feeStructure.installmentCount || installments.length}: {formatBRL(inst.amount)} — Vencimento em {formatDatePtBR(inst.dueDate)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {contract.feeStructure.feeModel === 'HYBRID' && (
                            <div className="mt-0.5 space-y-1">
                              <p>
                                Pelos serviços prestados, as partes convencionam remuneração advocatícia sob o regime híbrido (cumulativo):
                              </p>
                              <p className="pl-2">
                                <strong>I — Parcela Fixa (Pro Labore):</strong> O valor de <strong>{formatBRL(contract.feeStructure.fixedTotalAmount)}</strong>, parcelado em <strong>{contract.feeStructure.installmentCount || installments.length || 1} prestação(ões) mensal(is)</strong> de {formatBRL(installments[0]?.amount || ((contract.feeStructure.fixedTotalAmount || 0) / (contract.feeStructure.installmentCount || installments.length || 1)))}.
                              </p>
                              {installments.length > 0 && (
                                <div className="pl-5 py-0.5 space-y-0.5 font-mono text-[11px] text-slate-700">
                                  {installments.map((inst) => (
                                    <div key={inst.id || inst.installmentNumber}>
                                      • Parcela {inst.installmentNumber}/{contract.feeStructure.installmentCount || installments.length}: {formatBRL(inst.amount)} — Vencimento em {formatDatePtBR(inst.dueDate)}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="pl-2">
                                <strong>II — Parcela de Êxito (Quota Litis):</strong> O montante de <strong>{quotaLitis}% ({quotaLitis} por cento)</strong> incidente sobre todos os valores atrasados apurados entre a DER e a efetiva implantação do benefício.
                              </p>
                            </div>
                          )}

                          <p className="mt-1">
                            <strong>Parágrafo Único — Destacamento de Honorários na Fonte:</strong> Fica a CONTRATADA expressamente autorizada a requerer perante o juízo competente a juntada do presente contrato para fins de retenção e expedição de <strong>Requisição de Pequeno Valor (RPV) ou Precatório em seu próprio nome</strong> referente à sua cota-parte, nos exatos termos do artigo 22, § 4º da Lei Federal nº 8.906/94 (Estatuto da Advocacia e da OAB).
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                            CLÁUSULA TERCEIRA — DOS HONORÁRIOS SUCUMBENCIAIS
                          </h3>
                          <p className="mt-0.5">
                            Os honorários advocatícios eventualmente arbitrados judicialmente a título de sucumbência pertencerão com exclusividade aos patronos da causa, não se confundindo nem se compensando com os honorários contratuais estipulados na Cláusula Segunda (art. 23 da Lei 8.906/94).
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                            CLÁUSULA QUARTA — DOS DEVERES DE COOPERAÇÃO E VERACIDADE
                          </h3>
                          <p className="mt-0.5">
                            O CONTRATANTE obriga-se a fornecer com exatidão e pontualidade todos os documentos, certidões civis, comprovantes de trabalho rural/urbano e relatórios necessários ao deslinde da causa, responsabilizando-se civil e penalmente pelas informações declaradas à banca.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                            CLÁUSULA QUINTA — DA RESCISÃO E REVOGAÇÃO DE MANDATO
                          </h3>
                          <p className="mt-0.5">
                            A revogação unilateral do mandato outorgado sem justo motivo comprovado não desonera o CONTRATANTE do pagamento proporcional dos honorários devidos pelo trabalho profissional até então desempenhado pelos advogados.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                            CLÁUSULA SEXTA — DO FORO DE ELEIÇÃO
                          </h3>
                          <p className="mt-0.5">
                            Para dirimir quaisquer controvérsias decorrentes do presente contrato, as partes elegem o foro da Comarca de domicílio do CONTRATANTE, com expressa renúncia de qualquer outro.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
              </div>

                {/* Signatures */}
                <div className="pt-6 space-y-8 break-inside-avoid text-xs">
                  <div className="text-right text-slate-600">
                    {locale === 'en-US' ? `Location, ${getFullTodayDate()}.` : `Localidade, ${getFullTodayDate()}.`}
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-center pt-2">
                    <div className="border-t border-slate-800 pt-1.5">
                      <strong className="block text-slate-900">{contract.clientName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {locale === 'en-US' ? 'CLIENT' : 'CONTRATANTE'} • {locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} {contract.clientCpf}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-1.5">
                      <strong className="block text-slate-900">{contract.lawyerName || 'Dr. Alexandre Pontes'}</strong>
                      <span className="text-[11px] text-slate-500">
                        {contract.officeName || 'Alexandre Pontes Advogados'} • {contract.lawyerOab || 'OAB/AM'} • {locale === 'en-US' ? 'LAW FIRM' : 'CONTRATADA'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-4">
                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? 'Signature on Behalf (if illiterate):' : 'Assinatura a Rogo (se analfabeto):'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>

                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? '1st Witness:' : '1ª Testemunha Instrumentária:'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left text-[11px] pt-2">
                    <div className="border-t border-slate-400 pt-1">
                      <span>{locale === 'en-US' ? '2nd Witness:' : '2ª Testemunha Instrumentária:'}</span><br />
                      <span>{locale === 'en-US' ? 'Name:' : 'Nome:'} ____________________________________</span><br />
                      <span>{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} _____________________________________</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 2: PROCURAÇÃO AD JUDICIA */}
            {docType === 'POA' && (
              <div className="space-y-4 text-justify flex-1 flex flex-col justify-between">
                <div>
                  {/* POA Header */}
                  <div className="text-center border-b-2 border-[#082A52] pb-4 mb-4">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Poder Judiciário • Instituto Nacional do Seguro Social
                    </div>
                    <h2 className="font-bold text-base sm:text-lg text-[#082A52] uppercase mt-1">
                      Procuração Ad Judicia et Extra
                    </h2>
                    <div className="text-xs text-[#168447] font-bold mt-0.5">
                      Poderes Especiais Previdenciários (Art. 105 do CPC / Art. 22 Lei 8.906/94)
                    </div>
                  </div>

                  {contract.customPoaBody ? (
                    <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {contract.customPoaBody}
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                      <p>
                        <strong>OUTORGANTE:</strong> <strong>{contract.clientName}</strong>, brasileiro(a), inscrito(a) no Cadastro de Pessoas Físicas (CPF/MF) sob o nº <span className="font-mono font-bold">{contract.clientCpf}</span>, residente e domiciliado(a) no Estado da Paraíba.
                      </p>

                      <p>
                        <strong>OUTORGADOS:</strong> <strong>{contract.lawyerName || 'Dr. Alexandre Pontes'}</strong>, advogado inscrito na Ordem dos Advogados do Brasil sob a {contract.lawyerOab || 'OAB/AM nº 55.858'}, e os advogados associados integrantes da sociedade <strong>ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS</strong>, com escritório profissional onde recebem notificações, intimações e correspondências de estilo.
                      </p>

                      <div>
                        <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                          PODERES DA CLÁUSULA AD JUDICIA ET EXTRA
                        </h3>
                        <p className="mt-0.5">
                          Por este instrumento particular de procuração, o(a) Outorgante confere aos outorgados amplos e gerais poderes da cláusula <em>ad judicia et extra</em> para o foro em geral, em conjunto ou separadamente, podendo representá-lo(a) perante qualquer Juízo, Instância, Tribunal da Justiça Estadual, Justiça Federal e Juizados Especiais Federais, bem como perante autarquias públicas, agências da Previdência Social — <strong>INSTITUTO NACIONAL DO SEGURO SOCIAL (INSS)</strong>, Conselho de Recursos da Previdência Social (CRPS), Receita Federal do Brasil e órgãos fazendários.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                          PODERES ESPECIAIS EXPRESSOS (ART. 105 DO CÓDIGO DE PROCESSO CIVIL)
                        </h3>
                        <p className="mt-0.5">
                          Confere ainda poderes especiais e expressos para requerer, desistir, transigir, acordar, anuir, confessar, firmar compromissos, receber citações e intimações, interpor recursos administrativos e judiciais, renunciar a valores excedentes ao teto de 60 (sessenta) salários mínimos dos Juizados Especiais Federais (quando benéfico à celeridade processual), prestar depoimento, dar e receber quitação total ou parcial, e expressamente <strong>RECEBER E LEVANTAR ALVARÁS JUDICIAIS, PRECATÓRIOS E REQUISIÇÕES DE PEQUENO VALOR (RPV)</strong> perante a Caixa Econômica Federal e o Banco do Brasil S/A, retendo a cota-parte dos honorários advocatícios estipulados no contrato formal de honorários, substabelecer com ou sem reserva de iguais poderes, dando tudo por bom, firme e valioso.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-[#082A52] uppercase text-[11px]">
                          FINALIDADE ESPECÍFICA DO MANDATO
                        </h3>
                        <p className="mt-0.5">
                          A presente procuração destina-se especificamente ao pleito, concessão e liquidação do benefício previdenciário de <strong>{formatBenefitType(contract.benefitSpecies, 'pt-BR')}</strong> (Pasta do Cliente: {contract.physicalFileLocation}).
                        </p>
                      </div>
                    </div>
                  )}
              </div>

                {/* Signatures */}
                <div className="pt-8 space-y-8 break-inside-avoid text-xs">
                  <div className="text-right text-slate-600">
                    {locale === 'en-US' ? `Location, ${getFullTodayDate()}.` : `Localidade, ${getFullTodayDate()}.`}
                  </div>

                  <div className="max-w-xs mx-auto border-t border-slate-800 pt-2 text-center">
                    <strong className="block text-slate-900">{contract.clientName}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {locale === 'en-US' ? 'PRINCIPAL' : 'OUTORGANTE'} • {locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'} {contract.clientCpf}
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
            {docType === 'FOLDER_COVER' && (
              <div className="border-4 border-double border-[#082A52] p-6 sm:p-8 rounded-lg space-y-6">
                {/* Cover Header */}
                <div className="text-center border-b-2 border-[#082A52] pb-4">
                  <div className="flex items-center justify-center gap-2 text-[#082A52] mb-1">
                    <Scale className="w-5 h-5 text-[#C89543]" />
                    <span className="font-bold uppercase tracking-wider text-xs">{contract.officeName || 'Alexandre Pontes Sociedade de Advogados'}</span>
                  </div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-[#082A52] uppercase tracking-tight">
                    {locale === 'en-US' ? 'Social Security Case File' : 'Dossiê do Processo Previdenciário'}
                  </h2>
                  <div className="text-xs text-[#C89543] font-bold uppercase tracking-widest mt-0.5">
                    {locale === 'en-US' ? 'Central Physical Archive • OAB Records Management' : 'Arquivo Físico Central • Gestão Documental OAB'}
                  </div>
                </div>

                {/* Folder Badge Box */}
                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {locale === 'en-US' ? 'Folder Identification' : 'Identificação da Pasta'}
                    </span>
                    <div className="text-2xl font-mono font-extrabold text-[#082A52]">
                      {contract.contractNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {locale === 'en-US' ? 'Cabinet & Drawer' : 'Armário e Gaveta'}
                    </span>
                    <div className="text-sm font-bold text-[#C89543]">
                      {contract.physicalFileLocation || (locale === 'en-US' ? 'General Cabinet - Drawer 01' : 'Armário Geral - Gaveta 01')}
                    </div>
                  </div>
                </div>

                {/* Client Data Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
                    {locale === 'en-US' ? 'Client Registration Data' : 'Dados Cadastrais do Segurado(a)'}
                  </h3>
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium w-40">{locale === 'en-US' ? 'Full Name:' : 'Nome Completo:'}</td>
                        <td className="py-1.5 font-bold text-slate-900">{contract.clientName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Tax ID (CPF):' : 'CPF:'}</td>
                        <td className="py-1.5 font-mono font-bold text-slate-900">{contract.clientCpf}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Benefit Species:' : 'Espécie do Benefício:'}</td>
                        <td className="py-1.5 font-bold text-[#082A52]">{formatBenefitType(contract.benefitSpecies, locale === 'en-US' ? 'en-US' : 'pt-BR')}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Registered Contract:' : 'Contrato Registrado:'}</td>
                        <td className="py-1.5 font-mono text-slate-800">{contract.contractNumber}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 text-slate-500 font-medium">{locale === 'en-US' ? 'Contact Phone:' : 'Telefone de Contato:'}</td>
                        <td className="py-1.5 text-slate-800">{contract.clientPhone || (locale === 'en-US' ? 'Not informed' : 'Não informado')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Physical Documents Checklist */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider">
                    {locale === 'en-US' ? 'Mandatory Physical Documents in File' : 'Rol de Documentos Físicos Obrigatórios da Pasta'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Original Signed Power of Attorney' : 'Procuração Ad Judicia Original Assinada'}</span>
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
                      <span>{locale === 'en-US' ? 'Updated Proof of Residence' : 'Comprovante de Residência Atualizado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Full CNIS Statement and Physical Work Card' : 'Extrato CNIS Integral e CTPS Física'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">[  ]</span>
                      <span>{locale === 'en-US' ? 'Rural Declaration or Documentary Evidence' : 'Declaração Rural ou Prova Material e Laudos'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{locale === 'en-US' ? 'Filing Date:' : 'Data de Autuação:'} {getFullTodayDate()}</span>
                  <span>{contract.officeName || 'Alexandre Pontes Advogados'} • {contract.lawyerOab || 'OAB/AM'}</span>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Impressão A4 calibrada com suporte a cores e cabeçalho executivo.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 font-semibold transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
