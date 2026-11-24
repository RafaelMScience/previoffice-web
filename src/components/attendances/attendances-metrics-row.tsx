'use client';

import React from 'react';
import { Users, Clock, UserCheck, FileCheck2 } from 'lucide-react';
import type { AttendanceWithClient } from '@/types/attendance';

export type AttendanceFilterType =
  | 'ALL'
  | 'RETURN_DOCUMENTS'
  | 'FIRST_CONSULTATION'
  | 'CONTRACT_SIGNING';

interface AttendancesMetricsRowProps {
  attendances: AttendanceWithClient[];
  filterType: AttendanceFilterType;
  onSelectFilter: (type: AttendanceFilterType) => void;
  locale: string;
}

export function AttendancesMetricsRow({
  attendances,
  filterType,
  onSelectFilter,
  locale,
}: AttendancesMetricsRowProps) {
  const isEn = locale === 'en-US';

  const returnDocsCount = attendances.filter(
    (a) => a.attendanceType === 'RETURN_DOCUMENTS' || a.attendanceType === 'RETURN'
  ).length;

  const firstVisitCount = attendances.filter(
    (a) => a.attendanceType === 'FIRST_CONSULTATION' || a.attendanceType === 'FIRST_VISIT'
  ).length;

  const contractCount = attendances.filter(
    (a) => a.attendanceType === 'CONTRACT_SIGNING'
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total */}
      <button
        type="button"
        onClick={() => onSelectFilter('ALL')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
          filterType === 'ALL'
            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-[#C89543] shadow-md'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-800'
        }`}
        title={isEn ? 'Click to filter: All attendances' : 'Clique para filtrar: Todos os atendimentos'}
      >
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              filterType === 'ALL' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {isEn ? 'Total Consultations' : 'Total de Atendimentos'}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              filterType === 'ALL' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {attendances.length}
          </h3>
          <span
            className={`text-xs font-medium flex items-center gap-1 mt-1 ${
              filterType === 'ALL' ? 'text-[#C89543]' : 'text-slate-500'
            }`}
          >
            {filterType === 'ALL'
              ? isEn
                ? '● Active filter'
                : '● Filtro ativo'
              : isEn
              ? 'Consolidated history'
              : 'Histórico consolidado'}
          </span>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            filterType === 'ALL' ? 'bg-white/10 text-[#C89543]' : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Users className="w-6 h-6" />
        </div>
      </button>

      {/* Retornos com Documentos */}
      <button
        type="button"
        onClick={() => onSelectFilter('RETURN_DOCUMENTS')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
          filterType === 'RETURN_DOCUMENTS'
            ? 'bg-amber-900 text-white border-amber-900 ring-2 ring-[#C89543] shadow-md'
            : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm text-slate-800'
        }`}
        title={isEn ? 'Click to filter: Returns with Documents' : 'Clique para filtrar: Retornos com Documentos'}
      >
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              filterType === 'RETURN_DOCUMENTS' ? 'text-amber-200' : 'text-slate-500'
            }`}
          >
            {isEn ? 'Returns with Docs' : 'Retornos com Documentos'}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              filterType === 'RETURN_DOCUMENTS' ? 'text-white' : 'text-amber-600'
            }`}
          >
            {returnDocsCount}
          </h3>
          <span
            className={`text-xs font-medium flex items-center gap-1 mt-1 ${
              filterType === 'RETURN_DOCUMENTS' ? 'text-[#C89543]' : 'text-amber-600'
            }`}
          >
            {filterType === 'RETURN_DOCUMENTS'
              ? isEn
                ? '● Active filter'
                : '● Filtro ativo'
              : isEn
              ? 'Evidence intake'
              : 'Instrução probatória'}
          </span>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            filterType === 'RETURN_DOCUMENTS' ? 'bg-white/10 text-amber-200' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Clock className="w-6 h-6" />
        </div>
      </button>

      {/* 1ªs Consultas / Triagens */}
      <button
        type="button"
        onClick={() => onSelectFilter('FIRST_CONSULTATION')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
          filterType === 'FIRST_CONSULTATION'
            ? 'bg-blue-950 text-white border-blue-950 ring-2 ring-[#C89543] shadow-md'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm text-slate-800'
        }`}
        title={isEn ? 'Click to filter: 1st Consultations / Triage' : 'Clique para filtrar: 1ªs Consultas / Triagens'}
      >
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              filterType === 'FIRST_CONSULTATION' ? 'text-blue-200' : 'text-slate-500'
            }`}
          >
            {isEn ? '1st Consultations' : '1ªs Consultas / Triagens'}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              filterType === 'FIRST_CONSULTATION' ? 'text-white' : 'text-blue-600'
            }`}
          >
            {firstVisitCount}
          </h3>
          <span
            className={`text-xs font-medium flex items-center gap-1 mt-1 ${
              filterType === 'FIRST_CONSULTATION' ? 'text-[#C89543]' : 'text-slate-500'
            }`}
          >
            {filterType === 'FIRST_CONSULTATION'
              ? isEn
                ? '● Active filter'
                : '● Filtro ativo'
              : isEn
              ? 'New leads captured'
              : 'Novos clientes captados'}
          </span>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            filterType === 'FIRST_CONSULTATION' ? 'bg-white/10 text-blue-200' : 'bg-slate-50 text-slate-700'
          }`}
        >
          <UserCheck className="w-6 h-6" />
        </div>
      </button>

      {/* Contratos Formalizados */}
      <button
        type="button"
        onClick={() => onSelectFilter('CONTRACT_SIGNING')}
        className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
          filterType === 'CONTRACT_SIGNING'
            ? 'bg-emerald-950 text-white border-emerald-950 ring-2 ring-[#C89543] shadow-md'
            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm text-slate-800'
        }`}
        title={isEn ? 'Click to filter: Formalized Contracts' : 'Clique para filtrar: Contratos Formalizados'}
      >
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              filterType === 'CONTRACT_SIGNING' ? 'text-emerald-200' : 'text-slate-500'
            }`}
          >
            {isEn ? 'Signed Contracts' : 'Contratos Formalizados'}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              filterType === 'CONTRACT_SIGNING' ? 'text-white' : 'text-emerald-600'
            }`}
          >
            {contractCount}
          </h3>
          <span
            className={`text-xs font-medium flex items-center gap-1 mt-1 ${
              filterType === 'CONTRACT_SIGNING' ? 'text-[#C89543]' : 'text-emerald-600'
            }`}
          >
            {filterType === 'CONTRACT_SIGNING'
              ? isEn
                ? '● Active filter'
                : '● Filtro ativo'
              : isEn
              ? 'OAB POA Issued'
              : 'Procuração OAB emitida'}
          </span>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            filterType === 'CONTRACT_SIGNING' ? 'bg-white/10 text-emerald-200' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          <FileCheck2 className="w-6 h-6" />
        </div>
      </button>
    </div>
  );
}
