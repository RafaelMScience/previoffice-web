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

  const [isUploading, setIsUploading] = useState(false);
  const [newDocCategory, setNewDocCategory] = useState<DocumentCategory>('IDENTIFICATION');
  const [newDocName, setNewDocName] = useState('');

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

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const newDoc: LegalDocument = {
      id: `doc-${Date.now()}`,
      tenantId: 'tenant-default',
      clientId,
      originalName: `${newDocName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      displayName: newDocName.trim(),
      category: newDocCategory,
      mimeType: 'application/pdf',
      extension: '.pdf',
      sizeBytes: Math.floor(Math.random() * 800000) + 200000,
      storagePath: `secure_documents/${Math.random().toString(36).slice(2)}.apdoc`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setNewDocName('');
    setIsUploading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
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
          onClick={() => setIsUploading(!isUploading)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Upload className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.uploadDocBtn}</span>
        </button>
      </div>

      {/* Upload drawer form */}
      {isUploading && (
        <form
          onSubmit={handleSimulateUpload}
          className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#C89543]" />
              Novo Documento para a Pasta
            </span>
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.clientDetails.docName}
              </label>
              <input
                type="text"
                required
                placeholder="ex: Laudo Pericial Ortopedia 2026"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t.clientDetails.docCategory}
              </label>
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543]"
              >
                <option value="IDENTIFICATION">Identificação (RG / CPF)</option>
                <option value="ADDRESS_PROOF">Comprovante de Residência</option>
                <option value="EMPLOYMENT_BOOK">Carteira de Trabalho (CTPS)</option>
                <option value="CNIS_EXTRACT">Extrato CNIS / INSS</option>
                <option value="MEDICAL_REPORT">Laudo / Atestado Médico</option>
                <option value="PPP_LTCAT">PPP / LTCAT / Prova Rural</option>
                <option value="POWER_OF_ATTORNEY">Procuração / Contrato OAB</option>
                <option value="OTHER">Outros Documentos</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#C89543] hover:bg-[#b08137] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              Anexar ao Cofre Criptografado
            </button>
          </div>
        </form>
      )}

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
    </div>
  );
}
