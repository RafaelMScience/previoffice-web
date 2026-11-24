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
  CheckCircle2,
  Eye,
} from 'lucide-react';
import type { Contract } from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import {
  executePrintDocument,
  executeCopyText,
  type DocumentViewType,
  ContractAgreementSheet,
  ContractPoaSheet,
  ContractFolderCoverSheet,
  ContractCustomPdfViewer,
} from './print-modal';

interface ContractPrintModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractPrintModal({ contract, isOpen, onClose }: ContractPrintModalProps) {
  const { t, locale } = useI18n();
  const [docType, setDocType] = useState<DocumentViewType>('CONTRACT');
  const [copied, setCopied] = useState(false);
  const [viewCustomPdf, setViewCustomPdf] = useState(true);

  if (!isOpen || !contract) return null;

  const isEn = locale === 'en-US';

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

  const handleCopy = () => {
    const success = executeCopyText('contract-printable-sheet');
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    executePrintDocument({
      contract,
      docType,
      locale,
      hasActiveCustomPdf,
      viewCustomPdf,
      activeCustomDoc,
    });
  };

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
                {contract.contractNumber} • {contract.clientName} (
                {formatBenefitType(contract.benefitSpecies, isEn ? 'en-US' : 'pt-BR')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(!hasActiveCustomPdf || !viewCustomPdf) && (
              <button
                type="button"
                onClick={handleCopy}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copied ? (isEn ? 'Copied!' : 'Copiado!') : isEn ? 'Copy Text' : 'Copiar Texto'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-md transition-all border border-[#C89543]/40"
            >
              <Printer className="w-4 h-4 text-[#C89543]" />
              <span>
                {hasActiveCustomPdf && viewCustomPdf
                  ? isEn
                    ? 'Print Custom PDF'
                    : 'Imprimir PDF Personalizado'
                  : isEn
                  ? 'Print Document (A4)'
                  : 'Imprimir Documento (A4)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={isEn ? 'Close' : 'Fechar'}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Selection Tabs */}
        <div className="px-4 sm:px-6 pt-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setDocType('CONTRACT');
                setViewCustomPdf(true);
              }}
              className={`flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b-[3px] text-base sm:text-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                docType === 'CONTRACT'
                  ? 'border-[#082A52] text-[#082A52] bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-[#082A52] hover:bg-white/60 rounded-t-xl'
              }`}
            >
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#C89543] shrink-0" />
              <span>{isEn ? '1. OAB Fee Agreement' : '1. Contrato de Honorários OAB'}</span>
              {customContractDoc?.fileDataUrl && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  {isEn ? 'Linked PDF' : 'PDF Vinculado'}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setDocType('POA');
                setViewCustomPdf(true);
              }}
              className={`flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b-[3px] text-base sm:text-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                docType === 'POA'
                  ? 'border-[#082A52] text-[#082A52] bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-[#082A52] hover:bg-white/60 rounded-t-xl'
              }`}
            >
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
              <span>{isEn ? '2. Power of Attorney Ad Judicia' : '2. Procuração Ad Judicia et Extra'}</span>
              {customPoaDoc?.fileDataUrl && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  {isEn ? 'Linked PDF' : 'PDF Vinculado'}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDocType('FOLDER_COVER')}
              className={`flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b-[3px] text-base sm:text-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                docType === 'FOLDER_COVER'
                  ? 'border-[#082A52] text-[#082A52] bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-[#082A52] hover:bg-white/60 rounded-t-xl'
              }`}
            >
              <FolderLock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />
              <span>{isEn ? '3. Physical Folder Cover (Archive)' : '3. Capa de Pasta Física (Arquivo)'}</span>
            </button>
          </div>

          {/* Toggle button when custom PDF is available */}
          {hasActiveCustomPdf && (
            <button
              type="button"
              onClick={() => setViewCustomPdf(!viewCustomPdf)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors shrink-0 mb-1 shadow-2xs"
            >
              <Eye className="w-4 h-4 text-[#0B78D0]" />
              <span>
                {viewCustomPdf
                  ? isEn
                    ? 'View Standard System Draft'
                    : 'Visualizar Minuta Padrão do Sistema'
                  : isEn
                  ? 'View Custom Office PDF'
                  : 'Visualizar PDF do Escritório'}
              </span>
            </button>
          )}
        </div>

        {/* Paper Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-300/60 flex justify-center items-start">
          {hasActiveCustomPdf && viewCustomPdf && activeCustomDoc ? (
            <ContractCustomPdfViewer
              activeCustomDoc={activeCustomDoc}
              docType={docType}
              locale={locale}
            />
          ) : (
            <div
              id="contract-printable-sheet"
              className="bg-white w-full max-w-[794px] min-h-[1123px] h-auto shadow-2xl rounded-xs border border-slate-300 p-8 sm:p-14 md:p-16 text-slate-900 text-xs sm:text-sm leading-relaxed space-y-6 flex flex-col justify-between shrink-0 mb-8"
            >
              {docType === 'CONTRACT' && (
                <ContractAgreementSheet contract={contract} locale={locale} />
              )}
              {docType === 'POA' && (
                <ContractPoaSheet contract={contract} locale={locale} />
              )}
              {docType === 'FOLDER_COVER' && (
                <ContractFolderCoverSheet contract={contract} locale={locale} />
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isEn
                ? 'Calibrated A4 printing with color support and executive header.'
                : 'Impressão A4 calibrada com suporte a cores e cabeçalho executivo.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 font-semibold transition-all"
          >
            {isEn ? 'Close' : 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
}
