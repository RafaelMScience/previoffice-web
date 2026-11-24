'use client';

import React from 'react';
import { CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import type { PhysicalDocumentAttachment } from '@/types/contract';
import type { DocumentViewType } from './contract-print-engine';
import { formatDatePtBR } from '@/lib/utils/template-engine';

interface ContractCustomPdfViewerProps {
  activeCustomDoc: PhysicalDocumentAttachment;
  docType: DocumentViewType;
  locale: string;
}

export function ContractCustomPdfViewer({
  activeCustomDoc,
  docType,
  locale,
}: ContractCustomPdfViewerProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="w-full max-w-[850px] space-y-3">
      {/* Audit Banner */}
      <div
        className={`p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
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
                {isEn
                  ? 'Document Signed by Client (Official Active Standard)'
                  : 'Documento Assinado pelo Cliente (Padrão Ativo Oficial)'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                <Clock className="w-3.5 h-3.5" />
                {isEn
                  ? 'Office Custom Draft (Pending Signature)'
                  : 'Minuta Própria do Escritório (Pendente de Assinatura)'}
              </span>
            )}
            <span className="text-xs font-bold">
              {docType === 'CONTRACT'
                ? isEn
                  ? 'Fee Agreement'
                  : 'Contrato de Honorários'
                : isEn
                ? 'Power of Attorney'
                : 'Procuração Ad Judicia'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {isEn ? 'File:' : 'Arquivo:'} <strong>{activeCustomDoc.fileName}</strong> ({activeCustomDoc.fileSizeFormatted}) •{' '}
            {isEn ? 'Replaced by:' : 'Substituído por:'}{' '}
            <strong>{activeCustomDoc.replacedBy || activeCustomDoc.uploadedBy}</strong>{' '}
            {isEn ? 'on' : 'em'}{' '}
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
            <span>{isEn ? 'Open in New Tab' : 'Abrir em Nova Aba'}</span>
          </a>
        </div>
      </div>

      {/* Embedded PDF container */}
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden min-h-[780px]">
        {activeCustomDoc.fileDataUrl &&
        (activeCustomDoc.fileDataUrl.startsWith('data:application/pdf') ||
          activeCustomDoc.fileDataUrl.startsWith('blob:')) ? (
          <iframe
            src={activeCustomDoc.fileDataUrl}
            title={isEn ? 'Custom Office PDF' : 'PDF Personalizado do Escritório'}
            loading="lazy"
            className="w-full h-[780px] border-none"
          />
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            {isEn
              ? 'File not supported by inline viewer. Click "Open in New Tab".'
              : 'Arquivo não compatível com visualizador embutido. Clique em "Abrir em Nova Aba".'}
          </div>
        )}
      </div>
    </div>
  );
}
