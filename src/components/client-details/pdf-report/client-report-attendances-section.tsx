'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import type { Attendance, AttendanceType } from '@/types/attendance';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

interface ClientReportAttendancesSectionProps {
  attendances: Attendance[];
  visitCount?: number;
  lawyerName: string;
  includeAttendanceHistory: boolean;
  isEn: boolean;
}

export function ClientReportAttendancesSection({
  attendances,
  visitCount = 0,
  lawyerName,
  includeAttendanceHistory,
  isEn,
}: ClientReportAttendancesSectionProps) {
  if (!includeAttendanceHistory) return null;

  const getAttendanceTypeLabel = (type: AttendanceType) => {
    if (isEn) {
      switch (type) {
        case 'FIRST_CONSULTATION':
        case 'FIRST_VISIT':
          return '1st Consultation';
        case 'RETURN_DOCUMENTS':
        case 'RETURN':
          return 'Return with Documents';
        case 'CONTRACT_SIGNING':
          return 'Contract Signing';
        default:
          return 'Social Security Guidance';
      }
    }
    switch (type) {
      case 'FIRST_CONSULTATION':
      case 'FIRST_VISIT':
        return '1ª Consulta';
      case 'RETURN_DOCUMENTS':
      case 'RETURN':
        return 'Retorno c/ Documentos';
      case 'CONTRACT_SIGNING':
        return 'Assinatura de Contrato';
      default:
        return 'Orientação Previdenciária';
    }
  };

  return (
    <div className="space-y-2 pt-1 w-full">
      <div className="flex items-center justify-between pb-1 border-b border-[#D8E5EF]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#0B78D0]" />
          <h3 className="text-[11px] font-extrabold text-[#082A52] uppercase tracking-wider">
            {isEn ? 'In-Person Attendance History' : 'Histórico de Atendimentos Presenciais'}
          </h3>
        </div>
        <span className="text-[9px] font-bold text-[#082A52] bg-[#EEF6FD] px-2 py-0.5 rounded-full border border-[#D8E5EF]">
          {isEn ? 'Total Consultations:' : 'Total de Consultas:'} {attendances.length || visitCount}
        </span>
      </div>

      {attendances.length === 0 ? (
        <div className="bg-[#EEF6FD] border border-[#D8E5EF] rounded-lg p-3 text-center text-xs text-slate-600">
          {isEn
            ? 'No detailed attendance history registered for this client.'
            : 'Nenhum histórico detalhado de comparecimento registrado para este segurado.'}
        </div>
      ) : (
        <div className="border border-[#D8E5EF] rounded-lg overflow-hidden w-full">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#EEF6FD] text-[9px] uppercase font-bold text-[#082A52] border-b border-[#D8E5EF]">
              <tr>
                <th className="px-2.5 py-1.5">{isEn ? 'Date & Time' : 'Data e Hora'}</th>
                <th className="px-2.5 py-1.5">{isEn ? 'Type' : 'Tipo'}</th>
                <th className="px-2.5 py-1.5">{isEn ? 'Professional' : 'Profissional'}</th>
                <th className="px-2.5 py-1.5">{isEn ? 'Status' : 'Status'}</th>
                <th className="px-2.5 py-1.5">{isEn ? 'Objective & Notes' : 'Objetivo e Observações'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendances.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/50 break-inside-avoid">
                  <td className="px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap">
                    {new Date(att.attendedAt).toLocaleDateString(isEn ? 'en-US' : 'pt-BR')}{' '}
                    {isEn ? 'at' : 'às'}{' '}
                    {new Date(att.attendedAt).toLocaleTimeString(isEn ? 'en-US' : 'pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-2.5 py-1.5 font-medium text-[11px]">
                    {getAttendanceTypeLabel(att.attendanceType)}
                  </td>
                  <td className="px-2.5 py-1.5 text-slate-600 text-[11px]">
                    {att.attendantName || lawyerName}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <span className="text-[8px] font-bold text-[#168447] bg-[#E3F7E9] px-1.5 py-0.5 rounded">
                      {isEn ? 'Completed' : 'Realizado'}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 text-[11px] text-slate-600">
                    <span className="font-semibold block text-[#16324F]">
                      {formatBenefitType(att.objective, isEn ? 'en-US' : 'pt-BR')}
                    </span>
                    {att.narrativeHistory && (
                      <span className="line-clamp-2 text-slate-500 text-[10px]">
                        {att.narrativeHistory}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
