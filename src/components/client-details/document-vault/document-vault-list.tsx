'use client';

import React from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  ShieldCheck,
  Printer,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { LegalDocument, DocumentCategory } from '@/types/document';
import { getDocumentDownloadUrl } from '@/lib/services/document-service';

interface DocumentVaultListProps {
  documents: LegalDocument[];
  isLoading: boolean;
  clientName: string;
  onOpenUpload: () => void;
  onViewDoc: (doc: LegalDocument) => void;
  onPrintDoc: (doc: LegalDocument) => void;
  isPrintingId: string | null;
  onDeleteDoc: (doc: LegalDocument) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryBadge: (category: DocumentCategory) => string;
  locale: string;
}

export function DocumentVaultList({
  documents,
  isLoading,
  clientName,
  onOpenUpload,
  onViewDoc,
  onPrintDoc,
  isPrintingId,
  onDeleteDoc,
  formatFileSize,
  getCategoryBadge,
  locale,
}: DocumentVaultListProps) {
  const isEn = locale === 'en-US';

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#C89543]" />
        <span className="text-xs font-medium">
          {isEn
            ? 'Loading encrypted vault documents...'
            : 'Carregando documentos criptografados do cofre...'}
        </span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#C89543] flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          {isEn ? 'Document Vault Empty' : 'Cofre de Documentos Vazio'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {isEn
            ? `No documents attached for ${clientName} yet. Photos of documents (ID, Proof of Residence) will be compressed into WebP and encrypted automatically.`
            : `Nenhum documento anexado para ${clientName} ainda. Fotos de documentos (RG, CNH, Comprovantes) serão compactadas em WebP e cifradas automaticamente.`}
        </p>
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-[#C89543]" />
          <span>{isEn ? 'Attach First Document' : 'Anexar Primeiro Documento'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 divide-y divide-slate-100">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
              <FileText className="w-5 h-5 text-[#0B192E]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900">{doc.displayName}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                    doc.category
                  )}`}
                >
                  {doc.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
                <span>{doc.originalName}</span>
                <span>•</span>
                <span>{formatFileSize(doc.sizeBytes)}</span>
                <span>•</span>
                <span>
                  {new Date(doc.createdAt).toLocaleDateString(isEn ? 'en-US' : 'pt-BR')}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AES-256-GCM (.apdoc)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Visualizar */}
            <button
              onClick={() => onViewDoc(doc)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all"
              title={isEn ? 'Preview document full screen' : 'Visualizar documento em tela cheia'}
            >
              <Eye className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{isEn ? 'Preview' : 'Visualizar'}</span>
            </button>

            {/* Imprimir */}
            <button
              onClick={() => onPrintDoc(doc)}
              disabled={isPrintingId === doc.id}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#0B192E] hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all disabled:opacity-50"
              title={isEn ? 'Print document directly' : 'Imprimir documento diretamente'}
            >
              {isPrintingId === doc.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C89543]" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>{isEn ? 'Print' : 'Imprimir'}</span>
            </button>

            {/* Download */}
            <a
              href={getDocumentDownloadUrl(doc.id)}
              download={doc.originalName}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#C89543] hover:bg-amber-50 transition-colors"
              title={isEn ? 'Download decrypted copy' : 'Baixar cópia descriptografada'}
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Excluir */}
            <button
              onClick={() => onDeleteDoc(doc)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title={isEn ? 'Delete document permanently' : 'Excluir documento permanentemente'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
