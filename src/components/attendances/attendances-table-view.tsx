'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  FilterX,
} from 'lucide-react';
import type { AttendanceWithClient } from '@/types/attendance';
import { AttendancesTableSkeleton } from './attendances-table-skeleton';
import { AttendanceTypeBadge } from './attendance-type-badge';
import { formatCpf } from '@/lib/domain/cpf-validator';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

interface AttendancesTableViewProps {
  attendances: AttendanceWithClient[];
  loading: boolean;
  searchTerm: string;
  filterType: string;
  onClearFilters: () => void;
  locale: string;
}

export function AttendancesTableView({
  attendances,
  loading,
  searchTerm,
  filterType,
  onClearFilters,
  locale,
}: AttendancesTableViewProps) {
  const router = useRouter();
  const isEn = locale === 'en-US';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3.5">{isEn ? 'Client' : 'Cliente'}</th>
              <th scope="col" className="px-5 py-3.5">{isEn ? 'Attendance Type' : 'Tipo de Atendimento'}</th>
              <th scope="col" className="px-5 py-3.5">{isEn ? 'Objective / Benefit' : 'Objetivo / Benefício'}</th>
              <th scope="col" className="px-5 py-3.5">{isEn ? 'Date / Time' : 'Data / Hora'}</th>
              <th scope="col" className="px-5 py-3.5">{isEn ? 'Attendant' : 'Atendente'}</th>
              <th scope="col" className="px-5 py-3.5">{isEn ? 'Pending Items' : 'Pendências'}</th>
              <th scope="col" className="px-5 py-3.5 text-right">{isEn ? 'Action' : 'Ação'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <AttendancesTableSkeleton />
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-3">
                    <p className="text-sm">
                      {isEn
                        ? 'No attendances found with the selected filters.'
                        : 'Nenhum atendimento localizado com os filtros selecionados.'}
                    </p>
                    {(searchTerm || filterType !== 'ALL') && (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B192E] bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <FilterX className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Clear Filters' : 'Limpar Filtros'}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              attendances.map((att) => {
                const pendingCount = (att.pendingDocuments || []).filter((d) => !d.isDelivered).length;

                return (
                  <tr
                    key={att.id}
                    onClick={() => router.push(`/clientes/${att.clientId}`)}
                    className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                  >
                    {/* Client Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B192E] text-[#C89543] flex items-center justify-center font-bold text-xs shrink-0">
                          {att.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 group-hover:text-[#C89543] transition-colors block">
                            {att.clientName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            CPF: {formatCpf(att.clientCpf)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-5 py-4">
                      <AttendanceTypeBadge type={att.attendanceType} locale={locale} />
                    </td>

                    {/* Objective */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {formatBenefitType(att.objective, isEn ? 'en-US' : 'pt-BR')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(att.attendedAt).toLocaleDateString(isEn ? 'en-US' : 'pt-BR')}{' '}
                        {isEn ? 'at' : 'às'}{' '}
                        {new Date(att.attendedAt).toLocaleTimeString(isEn ? 'en-US' : 'pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Attendant */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {att.attendantName || (isEn ? 'Responsible Attorney' : 'Advogado Responsável')}
                      </span>
                    </td>

                    {/* Pending Docs */}
                    <td className="px-5 py-4">
                      {pendingCount > 0 ? (
                        <div className="flex flex-col gap-0.5 items-start">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-help"
                            title={`${isEn ? 'Pending documents:' : 'Documentos pendentes:'}\n${(
                              att.pendingDocuments || []
                            )
                              .filter((d) => !d.isDelivered)
                              .map((d) => `• ${d.description}`)
                              .join('\n')}`}
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              {pendingCount} {isEn ? 'pending' : 'pendente(s)'}
                            </span>
                          </span>
                          <span
                            className="text-[11px] text-slate-500 line-clamp-1 max-w-[210px]"
                            title={(att.pendingDocuments || [])
                              .filter((d) => !d.isDelivered)
                              .map((d) => d.description)
                              .join(', ')}
                          >
                            {(att.pendingDocuments || [])
                              .filter((d) => !d.isDelivered)
                              .map((d) => d.description)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{isEn ? 'Complete' : 'Completo'}</span>
                        </span>
                      )}
                    </td>

                    {/* Action Link */}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/clientes/${att.clientId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] group-hover:bg-[#C89543] transition-colors shadow-2xs"
                        title={isEn ? 'Open Client Case Desk' : 'Abrir Mesa do Advogado deste cliente'}
                      >
                        <span>{isEn ? 'Open Desk' : 'Atender'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
