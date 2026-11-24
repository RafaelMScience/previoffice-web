'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { executeReportPrint, PdfReportControls, ClientReportSheet } from './pdf-report/index';
import type { Client } from '@/types/client';
import type { Attendance } from '@/types/attendance';

interface ClientPdfReportModalProps {
  client: Client;
  attendances?: Attendance[];
  isOpen: boolean;
  onClose: () => void;
  lawyerName?: string;
  lawyerOab?: string;
  officeName?: string;
}

export function ClientPdfReportModal({
  client,
  attendances = [],
  isOpen,
  onClose,
  lawyerName = 'Advogado Titular',
  lawyerOab = 'OAB/AM',
  officeName = 'Sociedade de Advogados',
}: ClientPdfReportModalProps) {
  const { t, locale } = useI18n();
  const isEn = locale === 'en-US';

  // Export Presets
  const [preset, setPreset] = useState<'all' | 'registration' | 'attendances'>('all');

  // Modular Toggles
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeAddressAndContacts, setIncludeAddressAndContacts] = useState(true);
  const [includeSocioeconomic, setIncludeSocioeconomic] = useState(true);
  const [includePrevidenciary, setIncludePrevidenciary] = useState(true);
  const [includeAttendanceHistory, setIncludeAttendanceHistory] = useState(true);
  const [includeClientSignature, setIncludeClientSignature] = useState(true);
  const [includeLawyerSignature, setIncludeLawyerSignature] = useState(true);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'all' | 'registration' | 'attendances') => {
    setPreset(type);
    if (type === 'all') {
      setIncludePersonalData(true);
      setIncludeDocuments(true);
      setIncludeAddressAndContacts(true);
      setIncludeSocioeconomic(true);
      setIncludePrevidenciary(true);
      setIncludeAttendanceHistory(true);
      setIncludeClientSignature(true);
      setIncludeLawyerSignature(true);
    } else if (type === 'registration') {
      setIncludePersonalData(true);
      setIncludeDocuments(true);
      setIncludeAddressAndContacts(true);
      setIncludeSocioeconomic(true);
      setIncludePrevidenciary(true);
      setIncludeAttendanceHistory(false);
      setIncludeClientSignature(true);
      setIncludeLawyerSignature(true);
    } else if (type === 'attendances') {
      setIncludePersonalData(false);
      setIncludeDocuments(false);
      setIncludeAddressAndContacts(false);
      setIncludeSocioeconomic(false);
      setIncludePrevidenciary(false);
      setIncludeAttendanceHistory(true);
      setIncludeClientSignature(false);
      setIncludeLawyerSignature(true);
    }
  };

  const handlePrint = () => {
    executeReportPrint({
      clientFullName: client.fullName,
      isEn,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-pdf-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Controls Header (Screen Only Toolbar) */}
        <PdfReportControls
          t={t}
          clientFullName={`${isEn ? 'Client Official Record' : 'Relatório Oficial do Cliente'}: ${client.fullName}`}
          preset={preset}
          onApplyPreset={handleApplyPreset}
          onPrint={handlePrint}
          onClose={onClose}
          includePersonalData={includePersonalData}
          setIncludePersonalData={setIncludePersonalData}
          includeDocuments={includeDocuments}
          setIncludeDocuments={setIncludeDocuments}
          includeAddressAndContacts={includeAddressAndContacts}
          setIncludeAddressAndContacts={setIncludeAddressAndContacts}
          includeSocioeconomic={includeSocioeconomic}
          setIncludeSocioeconomic={setIncludeSocioeconomic}
          includePrevidenciary={includePrevidenciary}
          setIncludePrevidenciary={setIncludePrevidenciary}
          includeAttendanceHistory={includeAttendanceHistory}
          setIncludeAttendanceHistory={setIncludeAttendanceHistory}
          includeClientSignature={includeClientSignature}
          setIncludeClientSignature={setIncludeClientSignature}
          includeLawyerSignature={includeLawyerSignature}
          setIncludeLawyerSignature={setIncludeLawyerSignature}
        />

        {/* Gray Preview Drafting Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#CBD5E1]/60 flex justify-center items-start">
          <ClientReportSheet
            client={client}
            attendances={attendances}
            lawyerName={lawyerName}
            lawyerOab={lawyerOab}
            officeName={officeName}
            includePersonalData={includePersonalData}
            includeDocuments={includeDocuments}
            includeAddressAndContacts={includeAddressAndContacts}
            includeSocioeconomic={includeSocioeconomic}
            includePrevidenciary={includePrevidenciary}
            includeAttendanceHistory={includeAttendanceHistory}
            includeClientSignature={includeClientSignature}
            includeLawyerSignature={includeLawyerSignature}
            isEn={isEn}
          />
        </div>
      </div>
    </div>
  );
}
