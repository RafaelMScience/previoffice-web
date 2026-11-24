'use client';

import React from 'react';
import { Search } from 'lucide-react';
import type { TeamMember } from '@/types/settings';

interface TeamFiltersBarProps {
  filterType: string;
  setFilterType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  members: TeamMember[];
  locale: string;
}

export function TeamFiltersBar({
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  members,
  locale,
}: TeamFiltersBarProps) {
  const isEn = locale === 'en-US';

  const lawyerCount = members.filter((m) => m.memberType === 'LAWYER').length;
  const assistantCount = members.filter((m) => m.memberType === 'ASSISTANT').length;
  const internCount = members.filter((m) => m.memberType === 'INTERN').length;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'ALL'
              ? 'bg-[#082A52] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isEn ? 'All' : 'Todos'} ({members.length})
        </button>
        <button
          onClick={() => setFilterType('LAWYER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'LAWYER'
              ? 'bg-[#082A52] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isEn ? 'Lawyers' : 'Advogados'} ({lawyerCount})
        </button>
        <button
          onClick={() => setFilterType('ASSISTANT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'ASSISTANT'
              ? 'bg-[#082A52] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isEn ? 'Assistants' : 'Assistentes'} ({assistantCount})
        </button>
        <button
          onClick={() => setFilterType('INTERN')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'INTERN'
              ? 'bg-[#082A52] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isEn ? 'Interns' : 'Estagiários'} ({internCount})
        </button>
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isEn ? 'Search team member...' : 'Buscar colaborador...'}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#C89543] outline-hidden text-slate-800 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
