'use client';

import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { UploadDocumentModal } from './upload-document-modal';
import type { LegalDocument, DocumentCategory } from '@/types/document';
import {
  fetchClientDocuments,
  deleteClientDocument,
} from '@/lib/services/document-service';
import {
  executePrintDocument,
  DocumentViewerModal,
  DocumentDeleteModal,
  DocumentVaultList,
} from './document-vault/index';

interface DocumentVaultProps {
  clientId: string;
  clientName: string;
}

export function DocumentVault({ clientId, clientName }: DocumentVaultProps) {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const isEn = locale === 'en-US';

  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<LegalDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<LegalDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Fetch real documents on mount or clientId change
  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const docs = await fetchClientDocuments(clientId);
        if (isMounted) {
          setDocuments(docs);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(
            err?.message ||
              (isEn ? 'Failed to load vault documents.' : 'Erro ao carregar documentos do cofre.')
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (clientId) {
      loadDocuments();
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, isEn]);

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getCategoryBadge = (category: DocumentCategory) => {
    switch (category) {
      case 'IDENTIFICATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ADDRESS_PROOF':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'CNIS_EXTRACT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDICAL_REPORT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PPP_LTCAT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'POWER_OF_ATTORNEY':
      case 'FEE_CONTRACT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleUploadSuccess = (newDoc: LegalDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(
      isEn
        ? `Document "${newDoc.displayName}" encrypted and attached to vault!`
        : `Documento "${newDoc.displayName}" criptografado e anexado com sucesso ao cofre!`
    );
  };

  // Direct print implementation using print engine
  const handlePrintDocument = async (doc: LegalDocument) => {
    try {
      setIsPrinting(doc.id);
      await executePrintDocument(doc, () => setIsPrinting(null));
    } catch (err: any) {
      setIsPrinting(null);
      alert(
        `${isEn ? 'Error printing document' : 'Erro ao imprimir documento'}: ${
          err?.message || (isEn ? 'Internal error' : 'Falha interna')
        }`
      );
    }
  };

  // Optimistic document deletion with rollback
  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    const docToDelete = deletingDoc;
    const previousDocuments = [...documents];

    // Optimistic UI update: Remove document immediately from the screen
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
    setDeletingDoc(null);
    showToast(
      isEn
        ? `Document "${docToDelete.displayName}" removed.`
        : `Documento "${docToDelete.displayName}" removido.`
    );

    try {
      setIsDeleting(true);
      const res = await deleteClientDocument(docToDelete.id);
      showToast(
        isEn
          ? `Document "${docToDelete.displayName}" deleted successfully. Audit recorded by ${
              res.deletedByName || currentUser?.fullName || 'Operator'
            }.`
          : `Documento "${docToDelete.displayName}" excluído com sucesso. Registro auditado por ${
              res.deletedByName || currentUser?.fullName || 'Operador'
            }.`
      );
    } catch (err: any) {
      // Rollback on server failure
      setDocuments(previousDocuments);
      setErrorMessage(
        isEn
          ? `Could not delete document on server (${err?.message || 'Network error'}). Document restored.`
          : `Não foi possível excluir o documento no servidor (${err?.message || 'Erro de rede'}). O documento foi restaurado.`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchClientDocuments(clientId)
                .then(setDocuments)
                .catch((e) => setErrorMessage(e.message))
                .finally(() => setIsLoading(false));
            }}
            className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
          >
            {isEn ? 'Try again' : 'Tentar novamente'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#C89543]" />
            <h2 className="text-lg font-bold text-slate-900">{t.clientDetails.documentsTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isEn
              ? 'Digital vault protected with AES-256-GCM encryption at rest. Files are illegible in external leaks.'
              : 'Cofre digital protegido com criptografia AES-256-GCM em repouso. Arquivos ilegíveis em caso de vazamento externo.'}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Upload className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.uploadDocBtn}</span>
        </button>
      </div>

      {/* Documents List */}
      <DocumentVaultList
        documents={documents}
        isLoading={isLoading}
        clientName={clientName}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onViewDoc={setViewingDoc}
        onPrintDoc={handlePrintDocument}
        isPrintingId={isPrinting}
        onDeleteDoc={setDeletingDoc}
        formatFileSize={formatFileSize}
        getCategoryBadge={getCategoryBadge}
        locale={locale}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        clientId={clientId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        viewingDoc={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onPrintDocument={handlePrintDocument}
        locale={locale}
      />

      {/* Document Delete Confirmation Modal */}
      <DocumentDeleteModal
        deletingDoc={deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        currentUser={currentUser}
        formatFileSize={formatFileSize}
        locale={locale}
      />
    </div>
  );
}
