'use client';

import React from 'react';
import type { AttendanceType } from '@/types/attendance';

interface AttendanceTypeBadgeProps {
  type: AttendanceType;
  locale?: string;
}

export function AttendanceTypeBadge({ type, locale }: AttendanceTypeBadgeProps) {
  const isEn = locale === 'en-US';

  switch (type) {
    case 'FIRST_CONSULTATION':
    case 'FIRST_VISIT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {isEn ? '1st Consultation / Triage' : '1ª Consulta / Triagem'}
        </span>
      );
    case 'RETURN_DOCUMENTS':
    case 'RETURN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {isEn ? 'Return with Documents' : 'Retorno c/ Documentos'}
        </span>
      );
    case 'CONTRACT_SIGNING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {isEn ? 'OAB Contract Signing' : 'Assinatura de Contrato OAB'}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {isEn ? 'General Guidance' : 'Orientação Geral'}
        </span>
      );
  }
}
