'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';

export interface PdfReportControlsProps {
  t: Translations;
  clientFullName: string;
  preset: 'all' | 'registration' | 'attendances';
  onApplyPreset: (type: 'all' | 'registration' | 'attendances') => void;
  onPrint: () => void;
  onClose: () => void;
  includePersonalData: boolean;
  setIncludePersonalData: (val: boolean) => void;
  includeDocuments: boolean;
  setIncludeDocuments: (val: boolean) => void;
  includeAddressAndContacts: boolean;
  setIncludeAddressAndContacts: (val: boolean) => void;
  includeSocioeconomic: boolean;
  setIncludeSocioeconomic: (val: boolean) => void;
  includePrevidenciary: boolean;
  setIncludePrevidenciary: (val: boolean) => void;
  includeAttendanceHistory: boolean;
  setIncludeAttendanceHistory: (val: boolean) => void;
  includeClientSignature: boolean;
  setIncludeClientSignature: (val: boolean) => void;
  includeLawyerSignature: boolean;
  setIncludeLawyerSignature: (val: boolean) => void;
}

export function PdfReportControls({
  t,
  clientFullName,
  preset,
  onApplyPreset,
  onPrint,
  onClose,
  includePersonalData,
  setIncludePersonalData,
  includeDocuments,
  setIncludeDocuments,
  includeAddressAndContacts,
  setIncludeAddressAndContacts,
  includeSocioeconomic,
  setIncludeSocioeconomic,
  includePrevidenciary,
  setIncludePrevidenciary,
  includeAttendanceHistory,
  setIncludeAttendanceHistory,
  includeClientSignature,
  setIncludeClientSignature,
  includeLawyerSignature,
  setIncludeLawyerSignature,
}: PdfReportControlsProps) {
  const cd = t.clientDetails;

  return (
    <div className="bg-[#0B192E] text-white p-4 sm:p-5 relative shrink-0 border-b border-white/10">
      <button
        onClick={onClose}
        aria-label={cd.pdfCancel}
        className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        title={cd.pdfCancel}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
        <Printer className="w-4 h-4" />
        <span>{cd.clientPdfModalTitle}</span>
      </div>

      <h2 id="client-pdf-title" className="text-xl font-bold tracking-tight">
        {clientFullName}
      </h2>

      <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
        {cd.clientPdfModalSubtitle}
      </p>

      {/* Preset Buttons & Options Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            {cd.pdfPresetModels}
          </span>
          <button
            type="button"
            onClick={() => onApplyPreset('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'all'
                ? 'bg-[#C89543] text-white shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {cd.pdfPresetAll}
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('registration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'registration'
                ? 'bg-[#C89543] text-white shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {cd.pdfPresetRegistration}
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('attendances')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'attendances'
                ? 'bg-[#C89543] text-white shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {cd.pdfPresetAttendances}
          </button>
        </div>

        {/* Print Action Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {cd.pdfCancel}
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#C89543] hover:bg-[#b08137] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{cd.pdfPrintButton}</span>
          </button>
        </div>
      </div>

      {/* Granular Section Checkboxes */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-300">
        <span className="font-semibold text-slate-400">{cd.pdfIncludeHeader}</span>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includePersonalData}
            onChange={(e) => setIncludePersonalData(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecPersonal}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includeDocuments}
            onChange={(e) => setIncludeDocuments(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecDocs}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includeAddressAndContacts}
            onChange={(e) => setIncludeAddressAndContacts(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecAddress}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includeSocioeconomic}
            onChange={(e) => setIncludeSocioeconomic(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecSocio}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includePrevidenciary}
            onChange={(e) => setIncludePrevidenciary(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecPrev}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includeAttendanceHistory}
            onChange={(e) => setIncludeAttendanceHistory(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecAttendances}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includeClientSignature}
            onChange={(e) => setIncludeClientSignature(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecClientSig}</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-white select-none">
          <input
            type="checkbox"
            checked={includeLawyerSignature}
            onChange={(e) => setIncludeLawyerSignature(e.target.checked)}
            className="rounded text-[#C89543] focus:ring-[#C89543] w-3.5 h-3.5"
          />
          <span>{cd.pdfSecLawyerSig}</span>
        </label>
      </div>
    </div>
  );
}
