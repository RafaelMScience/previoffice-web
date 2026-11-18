'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, ShieldCheck, FolderArchive } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { Contract, PhysicalDocumentAttachment } from '@/types/contract';

interface UploadSignedModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (contractId: string, attachment: PhysicalDocumentAttachment) => void;
}

export function UploadSignedModal({
  contract,
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadSignedModalProps) {
  const { t } = useI18n();

  const [fileName, setFileName] = useState('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState('');
  const [fileType, setFileType] = useState<'application/pdf' | 'image/jpeg' | 'image/png'>('application/pdf');
  const [cabinetLocation, setCabinetLocation] = useState('');
  const [signerType, setSignerType] = useState<'CLIENT_SIGNATURE' | 'ROGO_WITNESSES' | 'LEGAL_REPRESENTATIVE'>(
    'CLIENT_SIGNATURE'
  );
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (contract) {
      setCabinetLocation(contract.physicalFileLocation || 'Armário Geral - Pasta Principal');
    }
  }, [contract]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contract) return null;

  const handleSimulateFileSelect = (name: string, size: string, type: 'application/pdf' | 'image/jpeg') => {
    setFileName(name);
    setFileSizeFormatted(size);
    setFileType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    const attachment: PhysicalDocumentAttachment = {
      id: `att-${Date.now()}`,
      fileName,
      fileSizeFormatted: fileSizeFormatted || '2.1 MB',
      fileType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Dr. Alexandre Pontes',
      physicalCabinetLocation: cabinetLocation,
      signerType,
      notes: notes || undefined,
    };

    onUploadSuccess(contract.id, attachment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-signed-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-5 relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <FolderArchive className="w-4 h-4" />
            <span>{t.contracts.modalUploadTitle}</span>
          </div>

          <h2 id="upload-signed-title" className="text-lg font-bold tracking-tight">
            Anexar Cópia Física: {contract.contractNumber}
          </h2>

          <p className="text-xs text-slate-300 mt-0.5">
            Cliente: <strong>{contract.clientName}</strong> • {contract.benefitSpecies}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                setFileName(file.name);
                setFileSizeFormatted(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                setFileType(file.type.includes('pdf') ? 'application/pdf' : 'image/jpeg');
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#C89543] bg-[#FEF9EE]'
                : fileName
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
            onClick={() => {
              if (!fileName) {
                handleSimulateFileSelect(
                  `Contrato_Assinado_${contract.clientName.replace(/\s+/g, '_')}.pdf`,
                  '2.4 MB',
                  'application/pdf'
                );
              }
            }}
          >
            {fileName ? (
              <div className="flex items-center justify-center gap-3 text-emerald-800">
                <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-xs truncate max-w-xs">{fileName}</span>
                  <span className="block text-[11px] text-slate-500">
                    {fileSizeFormatted} • Arquivo pronto para vinculação
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileName('');
                  }}
                  className="ml-auto text-xs text-rose-600 hover:underline"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">{t.contracts.dragDropPrompt}</p>
                <p className="text-[11px] text-slate-400">{t.contracts.dragDropSubtext}</p>
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  Selecionar do Computador
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3 text-xs">
            {/* Physical Cabinet Location */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {t.contracts.lblCabinetLocation}
              </label>
              <input
                type="text"
                required
                value={cabinetLocation}
                onChange={(e) => setCabinetLocation(e.target.value)}
                placeholder="ex: Armário B - Gaveta 03 - Pasta 2026-042"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#C89543]"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Localização exata onde a via física assinada em papel foi arquivada na sede.
              </span>
            </div>

            {/* Signer Modality */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Modalidade da Assinatura / Firma
              </label>
              <select
                value={signerType}
                onChange={(e) => setSignerType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
              >
                <option value="CLIENT_SIGNATURE">
                  Assinatura Própria do Segurado (Firma Manuscrita)
                </option>
                <option value="ROGO_WITNESSES">
                  Assinatura a Rogo com 2 Testemunhas (Segurado Não Alfabetizado)
                </option>
                <option value="LEGAL_REPRESENTATIVE">
                  Representante Legal / Curador / Procurador
                </option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {t.contracts.lblSignerNotes}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações complementares sobre a via física ou testemunhas presentes..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
              />
            </div>
          </div>

          {/* Compliance Alert */}
          <div className="bg-[#EEF6FD] border border-[#D8E5EF] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#082A52]">
            <ShieldCheck className="w-4 h-4 text-[#0B78D0] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              O arquivo digitalizado ficará permanentemente indexado ao prontuário do cliente em conformidade com o Código de Ética da OAB e a LGPD.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!fileName}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                fileName
                  ? 'bg-[#168447] hover:bg-[#126b39] text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {t.contracts.btnConfirmUpload}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
