'use client';

import React from 'react';
import {
  FileText,
  Printer,
  Edit3,
  Copy,
  Check,
  PanelLeftOpen,
} from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';
import type { GeneratedDocItem } from '../legal-contract-modal';

export interface ContractPreviewSheetProps {
  t: Translations;
  currentDoc: GeneratedDocItem;
  isSidebarsHidden: boolean;
  onRestoreSidebars: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onCopy: (text: string) => void;
  copied: boolean;
  onPrintSingle: () => void;
  onUpdateContent: (docId: string, content: string) => void;
  officeName: string;
  officeOab: string;
  clientFullName: string;
  clientId: string;
  selectedLawyer: { name: string; oab: string };
  cabinetLocation: string;
}

export function ContractPreviewSheet({
  t,
  currentDoc,
  isSidebarsHidden,
  onRestoreSidebars,
  isEditing,
  setIsEditing,
  onCopy,
  copied,
  onPrintSingle,
  onUpdateContent,
  officeName,
  officeOab,
  clientFullName,
  clientId,
  selectedLawyer,
  cabinetLocation,
}: ContractPreviewSheetProps) {
  const cd = t.clientDetails;

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-300/80 h-full">
      {/* Barra de Ações Rápidas da Folha */}
      <div className="bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#082A52] text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#C89543]" />
            <span>{cd.viewingDocLabel} {currentDoc.title}</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
            {currentDoc.categoryLabel}
          </span>

          {isSidebarsHidden && (
            <button
              type="button"
              onClick={onRestoreSidebars}
              className="ml-2 text-xs font-semibold text-[#0B78D0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
              <span>{cd.btnRestorePanels}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? cd.btnFinishEdit : cd.btnEditClauses}</span>
          </button>

          <button
            type="button"
            onClick={() => onCopy(currentDoc.content)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? cd.btnCopied : cd.btnCopyDoc}</span>
          </button>

          <button
            type="button"
            onClick={onPrintSingle}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#082A52] text-white hover:bg-[#0c396d] cursor-pointer shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-[#C89543]" />
            <span>{cd.btnPrintSingleSheet}</span>
          </button>
        </div>
      </div>

      {/* Folha A4 Renderizada */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 flex justify-center items-start">
        <div
          id="demo-a4-printable-area"
          className="bg-white w-full max-w-[800px] min-h-[1130px] shadow-2xl rounded-xs border border-slate-300 p-10 sm:p-14 text-slate-900 text-xs sm:text-sm leading-relaxed flex flex-col justify-between shrink-0 mb-12"
        >
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900">
                <span className="font-bold">{cd.freeEditActiveTitle}</span>
                <span>{cd.freeEditActiveDesc}</span>
              </div>
              <textarea
                value={currentDoc.content}
                onChange={(e) => onUpdateContent(currentDoc.id, e.target.value)}
                className="w-full h-[900px] p-4 text-xs sm:text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B78D0]"
              />
            </div>
          ) : (
            <>
              {/* Cabeçalho da Folha */}
              <div>
                <div className="text-center border-b border-slate-300 pb-4 mb-6">
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-900">
                    {officeName}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Sociedade de Advogados inscrita sob a {officeOab} • Advocacia Previdenciária Especializada
                  </p>
                </div>

                {/* Corpo do Documento */}
                <div className="whitespace-pre-line text-justify leading-relaxed font-serif text-[12px] sm:text-[13px] text-slate-800 space-y-4">
                  {currentDoc.content}
                </div>
              </div>

              {/* Rodapé e Assinaturas */}
              <div className="pt-12 mt-8 border-t border-slate-200 space-y-8">
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-400 w-3/4 mx-auto mb-1.5" />
                    <strong className="block text-slate-900">{clientFullName}</strong>
                    <span className="text-slate-600 text-[11px]">{cd.clientSignatoryLabel}</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 w-3/4 mx-auto mb-1.5" />
                    <strong className="block text-slate-900">{selectedLawyer.name}</strong>
                    <span className="text-slate-600 text-[11px]">{selectedLawyer.oab} • {cd.lawyerSignatoryLabel}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>{cd.oabRecordLabel} {clientId.substring(0, 8)}</span>
                  <span>{cd.physicalFileLabel} {cabinetLocation}</span>
                  <span>{cd.digitalEmissionPageLabel}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
