'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { AttendanceFilterType } from './attendances-metrics-row';

interface AttendancesSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: AttendanceFilterType;
  setFilterType: (type: AttendanceFilterType) => void;
  totalAttendances: number;
  locale: string;
}

export function AttendancesSearchBar({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  totalAttendances,
  locale,
}: AttendancesSearchBarProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isEn ? 'Search by client, CPF, objective...' : 'Buscar por cliente, CPF, objetivo...'}
          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            title={isEn ? 'Clear search' : 'Limpar busca'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
        <button
          type="button"
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterType === 'ALL'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isEn ? 'All' : 'Todos'} ({totalAttendances})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('RETURN_DOCUMENTS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterType === 'RETURN_DOCUMENTS'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isEn ? 'Returns with Docs' : 'Retornos com Documentos'}
        </button>
        <button
          type="button"
          onClick={() => setFilterType('FIRST_CONSULTATION')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterType === 'FIRST_CONSULTATION'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isEn ? '1st Consultation' : '1ª Consulta'}
        </button>
        <button
          type="button"
          onClick={() => setFilterType('CONTRACT_SIGNING')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterType === 'CONTRACT_SIGNING'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isEn ? 'Signed Contract' : 'Contrato Fechado'}
        </button>
      </div>
    </div>
  );
}
