'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, AlertCircle, FileText, CheckCircle2, ArrowUpRight, Clock, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCpf } from '@/lib/domain/cpf-validator';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { AttendanceType } from '@/types/attendance';

export interface ReceptionTableRow {
  id: string;
  fullName: string;
  cpf: string;
  photoUrl?: string | null;
  attendanceType: AttendanceType;
  lastVisitAt: string;
  totalVisits: number;
  pendingDocuments: string[];
  registrationProgress: number; // 0 to 100%
  assignedAttendant: string;
  benefitTypeNotes?: string;
}

interface ReceptionTableProps {
  rows?: ReceptionTableRow[];
  initialRows?: ReceptionTableRow[];
  onOpenMemoryCard: (row: ReceptionTableRow) => void;
}

const DEFAULT_ROWS: ReceptionTableRow[] = [];

type FilterCategory = 'ALL' | 'RETURNS_ONLY' | 'FIRST_VISITS' | 'PENDING_DOCS';

export function ReceptionTable({
  rows,
  initialRows,
  onOpenMemoryCard,
}: ReceptionTableProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');

  const effectiveRows = rows !== undefined ? rows : (initialRows || []);

  const filteredRows = useMemo(() => {
    return effectiveRows.filter((row) => {
      // Search matching
      const matchesSearch =
        row.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.cpf.includes(searchTerm.replace(/\D/g, ''));

      if (!matchesSearch) return false;

      // Filter category matching
      switch (activeFilter) {
        case 'RETURNS_ONLY':
          return row.attendanceType === 'RETURN_DOCUMENTS' || row.totalVisits > 1;
        case 'FIRST_VISITS':
          return row.attendanceType === 'FIRST_VISIT' || row.totalVisits === 1;
        case 'PENDING_DOCS':
          return row.pendingDocuments.length > 0;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [effectiveRows, searchTerm, activeFilter]);

  const renderAttendanceTypeBadge = (type: AttendanceType) => {
    switch (type) {
      case 'FIRST_VISIT':
      case 'FIRST_CONSULTATION':
        return <Badge variant="info">{t.receptionTable.badgeFirstVisit}</Badge>;
      case 'RETURN_DOCUMENTS':
      case 'RETURN':
        return <Badge variant="warning">{t.receptionTable.badgeDocReturn}</Badge>;
      case 'CONTRACT_SIGNING':
        return <Badge variant="success">{t.receptionTable.badgeContractSigning}</Badge>;
      case 'BENEFIT_INQUIRY':
      case 'BENEFIT_ANALYSIS':
        return <Badge variant="neutral">{t.receptionTable.badgeBenefitInquiry}</Badge>;
      default:
        return <Badge variant="neutral">{t.receptionTable.badgeGeneralQuery}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.receptionTable.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.receptionTable.filterAll} ({effectiveRows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('RETURNS_ONLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'RETURNS_ONLY'
                ? 'bg-[#C89543] text-[#0B192E] shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.receptionTable.filterReturns}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('FIRST_VISITS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'FIRST_VISITS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.receptionTable.filterFirstVisits}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('PENDING_DOCS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'PENDING_DOCS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.receptionTable.filterMissingDocs}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3.5">{t.receptionTable.colClientInfo}</th>
              <th scope="col" className="px-5 py-3.5">{t.receptionTable.colVisitDetails}</th>
              <th scope="col" className="px-5 py-3.5">{t.receptionTable.colFolderDocs}</th>
              <th scope="col" className="px-5 py-3.5">{t.receptionTable.colRegistrationStatus}</th>
              <th scope="col" className="px-5 py-3.5">{t.receptionTable.colAttendant}</th>
              <th scope="col" className="px-5 py-3.5 text-right">{t.receptionTable.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700 text-sm">Nenhum cliente ou visita registrada hoje</p>
                  <p className="text-xs text-slate-400 mt-1">Utilize o botão &quot;Entrada Rápida (15s)&quot; acima para iniciar o primeiro atendimento.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/clientes/${row.id}`)}
                >
                  {/* Client Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {row.photoUrl ? (
                        <img
                          src={row.photoUrl}
                          alt={row.fullName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs flex-shrink-0">
                          {row.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-[#C89543] transition-colors flex items-center gap-2">
                          {row.fullName}
                          {row.totalVisits > 1 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                              {row.totalVisits}x
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          CPF: {formatCpf(row.cpf)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Visit Details */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {renderAttendanceTypeBadge(row.attendanceType)}
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {row.lastVisitAt}
                      </span>
                    </div>
                  </td>

                  {/* Pending Docs */}
                  <td className="px-5 py-4">
                    {row.pendingDocuments.length > 0 ? (
                      <div className="flex flex-col gap-1 items-start">
                        <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{row.pendingDocuments.length} {t.receptionTable.pendingCount}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {row.pendingDocuments.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t.receptionTable.allDocsReceived}</span>
                      </div>
                    )}
                  </td>

                  {/* Registration Status */}
                  <td className="px-5 py-4">
                    <div className="w-36">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">{t.common.progress}</span>
                        <span className="font-bold text-slate-700">{row.registrationProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            row.registrationProgress >= 70
                              ? 'bg-emerald-500'
                              : row.registrationProgress >= 40
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${row.registrationProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Attendant */}
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      {row.assignedAttendant}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenMemoryCard(row)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1"
                        title={t.receptionTable.btnMemoryCard}
                      >
                        {t.receptionTable.btnMemoryCard}
                      </button>
                      <Link
                        href={`/clientes/${row.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] group-hover:bg-[#C89543] transition-colors shadow-2xs"
                        title="Atender Cliente / Abrir Mesa do Advogado"
                      >
                        <span>Atender</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {t.receptionTable.footerShowing} {filteredRows.length} {t.receptionTable.footerOf} {effectiveRows.length} {t.receptionTable.footerRecords}
        </span>
        <div className="flex items-center gap-2">
          <span>{t.receptionTable.footerPhysicalNotice}</span>
        </div>
      </div>
    </div>
  );
}
