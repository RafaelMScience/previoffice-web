'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  FileCheck,
  Upload,
  Download,
  Eye,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { UploadDocumentModal } from './upload-document-modal';
import type { LegalDocument, DocumentCategory } from '@/types/document';

interface DocumentVaultProps {
  clientId: string;
  clientName: string;
}

export function DocumentVault({ clientId, clientName }: DocumentVaultProps) {
  const { t } = useI18n();

  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      id: 'doc-1',
      tenantId: 'tenant-default',
      clientId,
      originalName: 'rg_cpf_digitalizado.pdf',
      displayName: 'RG e CPF Autenticados',
      category: 'IDENTIFICATION',
      mimeType: 'application/pdf',
      extension: '.pdf',
      sizeBytes: 1024 * 450, // 450 KB
      storagePath: 'secure_documents/rg_cpf.apdoc',
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'doc-2',
      tenantId: 'tenant-default',
      clientId,
      originalName: 'comprovante_residencia_rural.pdf',
      displayName: 'Comprovante de Residência (Energia Rural)',
      category: 'ADDRESS_PROOF',
      mimeType: 'application/pdf',
      extension: '.pdf',
      sizeBytes: 1024 * 280, // 280 KB
      storagePath: 'secure_documents/residencia.apdoc',
      createdAt: '2026-10-15T10:05:00.000Z',
      updatedAt: '2026-10-15T10:05:00.000Z',
    },
    {
      id: 'doc-3',
      tenantId: 'tenant-default',
      clientId,
      originalName: 'extrato_cnis_completo_inss.pdf',
      displayName: 'Extrato Previdenciário CNIS (Meu INSS)',
      category: 'CNIS_EXTRACT',
      mimeType: 'application/pdf',
      extension: '.pdf',
      sizeBytes: 1024 * 1250, // 1.25 MB
      storagePath: 'secure_documents/cnis_inss.apdoc',
      createdAt: '2026-11-02T14:30:00.000Z',
      updatedAt: '2026-11-02T14:30:00.000Z',
    },
    {
      id: 'doc-4',
      tenantId: 'tenant-default',
      clientId,
      originalName: 'certidao_itr_incra_2024.pdf',
      displayName: 'Declaração de Produtor Rural & ITR INCRA',
      category: 'PPP_LTCAT',
      mimeType: 'application/pdf',
      extension: '.pdf',
      sizeBytes: 1024 * 820,
      storagePath: 'secure_documents/itr.apdoc',
      createdAt: '2026-11-14T11:15:00.000Z',
      updatedAt: '2026-11-14T11:15:00.000Z',
    },
  ]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    showToast(`Documento "${newDoc.displayName}" criptografado e anexado com sucesso!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#C89543]" />
            <h2 className="text-lg font-bold text-slate-900">{t.clientDetails.documentsTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.clientDetails.documentsSubtitle}</p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Upload className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.uploadDocBtn}</span>
        </button>
      </div>

      {/* Document List */}
      <div className="mt-6 divide-y divide-slate-100">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
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
                  <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Criptografado E2EE
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() =>
                  alert(`Visualizando documento protegido: ${doc.displayName}`)
                }
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Visualizar documento"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  alert(`Baixando cópia decifrada: ${doc.originalName}`)
                }
                className="p-2 rounded-lg text-slate-500 hover:text-[#C89543] hover:bg-amber-50 transition-colors"
                title="Download do arquivo"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Mini Window Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        clientId={clientId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
