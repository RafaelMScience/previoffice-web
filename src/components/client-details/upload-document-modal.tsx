'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { LegalDocument, DocumentCategory } from '@/types/document';
import { uploadClientDocument } from '@/lib/services/document-service';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onUploadSuccess: (newDoc: LegalDocument) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  clientId,
  onUploadSuccess,
}: UploadDocumentModalProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('IDENTIFICATION');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);

    // Auto-generate display name from file name without extension
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const formatted = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    if (!displayName) {
      setDisplayName(formatted);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !displayName.trim()) return;

    try {
      setIsUploading(true);
      setErrorMessage(null);

      if (selectedFile.type.startsWith('image/')) {
        setUploadStatus('Otimizando e comprimindo imagem (WebP ultra nítido)...');
      } else {
        setUploadStatus('Preparando e criptografando arquivo com AES-256-GCM...');
      }

      const newDoc = await uploadClientDocument({
        file: selectedFile,
        clientId,
        displayName: displayName.trim(),
        category,
      });

      onUploadSuccess(newDoc);
      setSelectedFile(null);
      setDisplayName('');
      setUploadStatus('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao criptografar ou enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Upload className="w-4 h-4" />
            <span>{t.clientDetails.uploadModalTitle}</span>
          </div>

          <p className="text-xs text-slate-300">
            {t.clientDetails.uploadModalSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!selectedFile && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#C89543] bg-amber-50/60 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-bold text-slate-900 truncate max-w-[240px]">
                      {selectedFile.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono">
                      {formatFileSize(selectedFile.size)} • {t.clientDetails.fileSelected}
                      {selectedFile.type.startsWith('image/') && ' • Auto WebP'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  disabled={isUploading}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                  title={t.clientDetails.removeFile}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#0B192E]">
                  <Upload className="w-6 h-6 text-[#C89543]" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    {t.clientDetails.dragDropPrompt}
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    {t.clientDetails.dragDropSubtext}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <span>{t.clientDetails.chooseFileBtn}</span>
                </button>
              </div>
            )}
          </div>

          {/* Document Title / Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.docName} *
            </label>
            <input
              type="text"
              required
              disabled={isUploading}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ex: RG e CPF Digitalizados Frente e Verso"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 disabled:opacity-50"
            />
          </div>

          {/* Document Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.docCategory} *
            </label>
            <select
              value={category}
              disabled={isUploading}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium disabled:opacity-50"
            >
              <option value="IDENTIFICATION">Identificação (RG / CPF / CNH)</option>
              <option value="ADDRESS_PROOF">Comprovante de Residência</option>
              <option value="EMPLOYMENT_BOOK">Carteira de Trabalho (CTPS)</option>
              <option value="CNIS_EXTRACT">Extrato Previdenciário (CNIS / Meu INSS)</option>
              <option value="MEDICAL_REPORT">Laudo / Atestado Médico (CID)</option>
              <option value="PPP_LTCAT">PPP / LTCAT / Prova Rural (ITR/INCRA)</option>
              <option value="POWER_OF_ATTORNEY">Procuração / Contrato OAB Assinado</option>
              <option value="OTHER">Outros Documentos</option>
            </select>
          </div>

          {/* Security & Compression Indicator */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 text-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Criptografia de Ponta a Ponta (AES-256-GCM)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O arquivo é cifrado antes de ser salvo no cofre digital (.apdoc). Mesmo em caso de invasão externa aos servidores, os dados permanecem 100% ilegíveis e protegidos sob a LGPD.
            </p>
            {selectedFile?.type.startsWith('image/') && (
              <div className="flex items-center gap-1.5 text-[#C89543] font-medium pt-1 border-t border-slate-200/60">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Compressão WebP inteligente ativada (reduz peso sem perder nitidez de assinaturas).</span>
              </div>
            )}
          </div>

          {/* Status when uploading */}
          {isUploading && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2 animate-pulse">
              <span className="w-3 h-3 rounded-full bg-[#C89543] animate-ping" />
              <span className="font-medium">{uploadStatus}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {t.clientDetails.btnClose}
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !displayName.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#C89543]" />
              <span>
                {isUploading ? 'Processando & Criptografando...' : t.clientDetails.btnUploadSubmit}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
