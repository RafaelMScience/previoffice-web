'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Check,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  FolderLock,
} from 'lucide-react';

interface ContractPdfUploadSectionProps {
  uploadedFile: File | null;
  uploadedFileName: string;
  uploadedFileSizeFormatted: string;
  documentCategory: 'FEE_CONTRACT' | 'POWER_OF_ATTORNEY' | 'OTHER';
  onDocumentCategoryChange: (cat: 'FEE_CONTRACT' | 'POWER_OF_ATTORNEY' | 'OTHER') => void;
  isSignedDocument: boolean;
  onIsSignedDocumentChange: (signed: boolean) => void;
  cabinetLocation: string;
  onCabinetLocationChange: (loc: string) => void;
  onProcessFile: (file: File) => void;
  onRemoveFile: () => void;
  locale: string;
}

export function ContractPdfUploadSection({
  uploadedFile,
  uploadedFileName,
  uploadedFileSizeFormatted,
  documentCategory,
  onDocumentCategoryChange,
  isSignedDocument,
  onIsSignedDocumentChange,
  cabinetLocation,
  onCabinetLocationChange,
  onProcessFile,
  onRemoveFile,
  locale,
}: ContractPdfUploadSectionProps) {
  const isEn = locale === 'en-US';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onProcessFile(file);
  };

  return (
    <div className="p-4 bg-slate-50/90 border border-slate-300 rounded-xl space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#082A52] uppercase flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4 text-[#0B78D0]" />
          <span>
            {isEn
              ? '4. Replace Template with Office Custom PDF (Optional)'
              : '4. Substituir Minuta por PDF Próprio do Escritório (Opcional)'}
          </span>
        </label>
        {uploadedFile && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-600" />
            {isEn ? 'Linked PDF' : 'PDF Vinculado'}
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed">
        {isEn
          ? 'If you have your own styled template with your law firm visual identity (logo, brand colors, fonts or headers), upload the PDF file to replace the system-generated draft for this client.'
          : 'Caso você já possua um modelo próprio formatado com sua identidade visual (logotipo, cores, fontes ou cabeçalho próprio), envie o arquivo em PDF para substituir o modelo gerado pelo sistema como padrão deste cliente.'}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {!uploadedFile ? (
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
            if (file) onProcessFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#0B78D0] bg-blue-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-[#0B78D0] bg-white hover:bg-slate-50/50'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-700">
            {isEn
              ? 'Drag & drop your PDF file here or click to browse'
              : 'Arraste e solte o arquivo PDF aqui ou clique para selecionar'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isEn
              ? 'Supports .PDF files up to 15MB with your custom layout'
              : 'Suporta arquivos .PDF de até 15MB com sua formatação personalizada'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File summary card */}
          <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-800 truncate max-w-sm">
                  {uploadedFileName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {uploadedFileSizeFormatted} •{' '}
                  {isEn
                    ? 'PDF document ready for secure encrypted storage'
                    : 'Documento PDF pronto para armazenamento seguro'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title={isEn ? 'Remove file' : 'Remover arquivo'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Purpose / Category of Document */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              {isEn ? 'Purpose of Uploaded PDF Document:' : 'Finalidade do Documento PDF Enviado:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onDocumentCategoryChange('FEE_CONTRACT')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  documentCategory === 'FEE_CONTRACT'
                    ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 font-bold text-[#082A52]'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs">{isEn ? 'Legal Fee Agreement' : 'Contrato de Honorários'}</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  {isEn ? 'Replaces OAB standard agreement' : 'Substitui o contrato OAB'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onDocumentCategoryChange('POWER_OF_ATTORNEY')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  documentCategory === 'POWER_OF_ATTORNEY'
                    ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 font-bold text-[#082A52]'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs">{isEn ? 'Power of Attorney' : 'Procuração Ad Judicia'}</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  {isEn ? 'Replaces power of attorney' : 'Substitui a procuração'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onDocumentCategoryChange('OTHER')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  documentCategory === 'OTHER'
                    ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 font-bold text-[#082A52]'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs">{isEn ? 'Other Documents' : 'Outros Documentos'}</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  {isEn ? 'Case dossier or attachment' : 'Dossiê ou anexo advocatício'}
                </div>
              </button>
            </div>
          </div>

          {/* Signature status radio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              {isEn
                ? 'Signature Status of Uploaded Document:'
                : 'Estado da Assinatura do Documento Enviado:'}
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  isSignedDocument
                    ? 'border-emerald-500 bg-emerald-50/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="signatureStatus"
                  checked={isSignedDocument}
                  onChange={() => onIsSignedDocumentChange(true)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEn ? 'Already signed by the client' : 'Já está assinado pelo cliente'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5">
                    {isEn
                      ? 'The contract will be generated with status Signed / Active and this custom PDF will be the definitive document.'
                      : 'O contrato será gerado com status Assinado / Ativo e este PDF personalizado será o documento padrão definitivo do cliente na plataforma.'}
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  !isSignedDocument
                    ? 'border-amber-500 bg-amber-50/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="signatureStatus"
                  checked={!isSignedDocument}
                  onChange={() => onIsSignedDocumentChange(false)}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {isEn
                        ? 'Not signed yet (Custom draft ready to collect client signature)'
                        : 'Não está assinado (Minuta personalizada para colher assinatura)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    {isEn
                      ? 'Replaces the default template with your custom PDF. Status will be Pending Signature.'
                      : 'Substitui a minuta padrão do sistema pelo seu PDF customizado. O status ficará Pendente de Assinatura, e ao colher a assinatura bastará anexar a via finalizada pelo ícone de anexo da tabela.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Optional Physical Cabinet location */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
          <FolderLock className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isEn
              ? 'Physical Archive Folder Location (Optional)'
              : 'Localização da Pasta no Arquivo Físico (Opcional)'}
          </span>
        </label>
        <input
          type="text"
          value={cabinetLocation}
          onChange={(e) => onCabinetLocationChange(e.target.value)}
          placeholder={isEn ? 'e.g. Cabinet B - Drawer 03 - Folder 2026-042' : 'Ex: Armário B - Gaveta 03 - Pasta 2026-042'}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
        />
      </div>
    </div>
  );
}
