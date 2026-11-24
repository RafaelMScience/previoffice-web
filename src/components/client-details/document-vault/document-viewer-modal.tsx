'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import type { LegalDocument } from '@/types/document';
import {
  getDocumentViewUrl,
  getDocumentDownloadUrl,
} from '@/lib/services/document-service';

interface DocumentViewerModalProps {
  viewingDoc: LegalDocument | null;
  onClose: () => void;
  onPrintDocument: (doc: LegalDocument) => void;
  locale: string;
}

export function DocumentViewerModal({
  viewingDoc,
  onClose,
  onPrintDocument,
  locale,
}: DocumentViewerModalProps) {
  const isEn = locale === 'en-US';
  const [viewBlobUrl, setViewBlobUrl] = useState<string | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  useEffect(() => {
    if (!viewingDoc) {
      if (viewBlobUrl) {
        URL.revokeObjectURL(viewBlobUrl);
        setViewBlobUrl(null);
      }
      setViewError(null);
      setIsLoadingView(false);
      return;
    }

    let isMounted = true;
    setIsLoadingView(true);
    setViewError(null);

    const docUrl = getDocumentViewUrl(viewingDoc.id);

    fetch(docUrl)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Erro ${res.status} ao descriptografar documento.`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        const objectUrl = URL.createObjectURL(blob);
        setViewBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (!isMounted) return;
        setViewError(err?.message || (isEn ? 'Failed to decrypt document.' : 'Falha ao descriptografar documento.'));
      })
      .finally(() => {
        if (isMounted) setIsLoadingView(false);
      });

    return () => {
      isMounted = false;
      if (viewBlobUrl) {
        URL.revokeObjectURL(viewBlobUrl);
      }
    };
  }, [viewingDoc]);

  if (!viewingDoc) return null;

  const isImageMime = (mime: string, ext?: string) => {
    return (
      mime.startsWith('image/') ||
      ext === '.png' ||
      ext === '.jpg' ||
      ext === '.jpeg' ||
      ext === '.webp'
    );
  };

  const isPdfMime = (mime: string, ext?: string) => {
    return mime === 'application/pdf' || ext === '.pdf';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-[#0B192E] text-white px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="w-5 h-5 text-[#C89543] shrink-0" />
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-white truncate">
                {viewingDoc.displayName}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="truncate">{viewingDoc.originalName}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  {isEn ? 'Decrypted in-memory' : 'Descriptografado em memória'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onPrintDocument(viewingDoc)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title={isEn ? 'Print document' : 'Imprimir documento'}
            >
              <Printer className="w-3.5 h-3.5 text-[#C89543]" />
              <span className="hidden sm:inline">{isEn ? 'Print' : 'Imprimir'}</span>
            </button>

            <a
              href={getDocumentDownloadUrl(viewingDoc.id)}
              download={viewingDoc.originalName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title={isEn ? 'Download file' : 'Baixar arquivo'}
            >
              <Download className="w-3.5 h-3.5 text-[#C89543]" />
              <span className="hidden sm:inline">{isEn ? 'Download' : 'Baixar'}</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Viewer */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4 flex items-center justify-center min-h-[450px]">
          {isLoadingView ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#C89543]" />
              <p className="text-xs font-semibold">
                {isEn
                  ? 'Decrypting document protected with AES-256-GCM...'
                  : 'Descriptografando documento protegido com AES-256-GCM...'}
              </p>
            </div>
          ) : viewError ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-rose-200 shadow-xs max-w-md">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                {isEn ? 'Could not display document' : 'Não foi possível visualizar o documento'}
              </h4>
              <p className="text-xs text-rose-600 mb-4">{viewError}</p>
              <a
                href={getDocumentDownloadUrl(viewingDoc.id)}
                download={viewingDoc.originalName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] text-white text-xs font-bold rounded-xl hover:bg-[#142642] shadow-xs"
              >
                <Download className="w-4 h-4 text-[#C89543]" />
                <span>{isEn ? 'Download Decrypted Copy' : 'Baixar Arquivo Descriptografado'}</span>
              </a>
            </div>
          ) : isImageMime(viewingDoc.mimeType, viewingDoc.extension) ? (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={viewBlobUrl || getDocumentViewUrl(viewingDoc.id)}
                alt={viewingDoc.displayName}
                className="max-h-[75vh] w-auto max-w-full rounded-lg shadow-md object-contain bg-white"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : isPdfMime(viewingDoc.mimeType, viewingDoc.extension) ? (
            <iframe
              src={viewBlobUrl || getDocumentViewUrl(viewingDoc.id)}
              title={viewingDoc.displayName}
              loading="lazy"
              className="w-full h-[75vh] rounded-lg border border-slate-300 shadow-xs bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md">
              <FileQuestion className="w-12 h-12 text-[#C89543] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                {isEn ? 'Inline view not available' : 'Visualização direta não disponível'}
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                {isEn
                  ? `This format (${viewingDoc.extension || viewingDoc.mimeType}) can be downloaded decrypted for viewing.`
                  : `Este formato (${viewingDoc.extension || viewingDoc.mimeType}) pode ser baixado de forma decifrada para abertura no seu computador.`}
              </p>
              <a
                href={getDocumentDownloadUrl(viewingDoc.id)}
                download={viewingDoc.originalName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] text-white text-xs font-bold rounded-xl hover:bg-[#142642] shadow-xs"
              >
                <Download className="w-4 h-4 text-[#C89543]" />
                <span>{isEn ? 'Download Decrypted Copy' : 'Baixar Arquivo Descriptografado'}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
