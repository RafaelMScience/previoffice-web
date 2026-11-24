'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, UserCheck, ArrowUpRight, FilterX } from 'lucide-react';
import type { AttendanceWithClient } from '@/types/attendance';
import { AttendanceTypeBadge } from './attendance-type-badge';
import { formatCpf } from '@/lib/domain/cpf-validator';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

interface AttendancesTimelineViewProps {
  attendances: AttendanceWithClient[];
  searchTerm: string;
  filterType: string;
  onClearFilters: () => void;
  onToggleDocStatus: (attendanceId: string, docId: string) => void;
  locale: string;
}

export function AttendancesTimelineView({
  attendances,
  searchTerm,
  filterType,
  onClearFilters,
  onToggleDocStatus,
  locale,
}: AttendancesTimelineViewProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {isEn
              ? 'Chronological Attendances Timeline'
              : 'Linha do Tempo Cronológica de Atendimentos'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEn
              ? 'Detailed view of client narratives, evidence intake and legal decisions taken in each consultation.'
              : 'Visão aprofundada dos fatos narrados, evolução probatória e decisões tomadas em cada consulta.'}
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {attendances.length} {isEn ? 'record(s)' : 'registro(s)'}
        </span>
      </div>

      {attendances.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3">
          <p className="text-sm">
            {isEn
              ? 'No attendances found in timeline with selected filters.'
              : 'Nenhum atendimento localizado na linha do tempo com os filtros selecionados.'}
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
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {attendances.map((att, idx) => {
            const isFirst = idx === 0;

            return (
              <div key={att.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isFirst
                      ? 'bg-[#C89543] border-[#0B192E] text-white shadow-xs'
                      : 'bg-white border-slate-300 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isFirst ? 'bg-white' : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Card Content */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-5 rounded-xl border border-slate-200 transition-colors space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <AttendanceTypeBadge type={att.attendanceType} locale={locale} />
                      <Link
                        href={`/clientes/${att.clientId}`}
                        className="font-bold text-sm text-[#0B192E] hover:text-[#C89543] transition-colors"
                      >
                        {att.clientName}
                      </Link>
                      <span className="text-xs text-slate-500 font-mono">
                        CPF: {formatCpf(att.clientCpf)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(att.attendedAt).toLocaleDateString(isEn ? 'en-US' : 'pt-BR')}{' '}
                        {isEn ? 'at' : 'às'}{' '}
                        {new Date(att.attendedAt).toLocaleTimeString(isEn ? 'en-US' : 'pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Objective */}
                  <div className="text-xs font-semibold text-slate-800">
                    <span className="text-slate-500 font-normal">
                      {isEn ? 'Objective: ' : 'Objetivo: '}
                    </span>
                    {formatBenefitType(att.objective, isEn ? 'en-US' : 'pt-BR')}
                  </div>

                  {/* Narrative History */}
                  {att.narrativeHistory && (
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      <span className="block font-bold text-slate-900 mb-1">
                        {isEn ? 'Client Narrative:' : 'Relato do Cliente:'}
                      </span>
                      <p className="whitespace-pre-line">{att.narrativeHistory}</p>
                    </div>
                  )}

                  {/* Legal Strategy */}
                  {att.notes && (
                    <div className="text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                      <span className="block font-bold text-amber-950 mb-1">
                        {isEn
                          ? 'Legal Strategy & Instructions:'
                          : 'Estratégia e Orientação Jurídica:'}
                      </span>
                      <p>{att.notes}</p>
                    </div>
                  )}

                  {/* Pending Documents Checklist */}
                  {att.pendingDocuments && att.pendingDocuments.length > 0 && (
                    <div className="pt-1">
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {isEn
                          ? 'Linked Documents (click to toggle status):'
                          : 'Documentos Vinculados (clique para alternar status):'}
                      </span>
                      <div className="space-y-1.5">
                        {att.pendingDocuments.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => onToggleDocStatus(att.id, doc.id)}
                            className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 group/doc text-left w-full py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                            title={
                              doc.isDelivered
                                ? isEn
                                  ? 'Document delivered. Click to uncheck.'
                                  : 'Documento entregue. Clique para desmarcar.'
                                : isEn
                                ? 'Document pending. Click to mark as delivered.'
                                : 'Documento pendente. Clique para marcar como recebido.'
                            }
                          >
                            <span
                              className={`w-4 h-4 rounded-sm border flex items-center justify-center font-bold text-[9px] transition-colors shrink-0 ${
                                doc.isDelivered
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                  : 'bg-white border-slate-300 text-transparent group-hover/doc:border-[#C89543]'
                              }`}
                            >
                              {doc.isDelivered ? '✓' : ''}
                            </span>
                            <span
                              className={`flex-1 ${
                                doc.isDelivered
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800'
                              }`}
                            >
                              {doc.description}
                            </span>
                            {doc.isDelivered && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                {isEn ? 'Delivered' : 'Entregue'}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {isEn ? 'Attendant: ' : 'Atendente: '}
                        {att.attendantName ||
                          (isEn ? 'Responsible Attorney' : 'Advogado Responsável')}
                      </span>
                    </span>

                    <Link
                      href={`/clientes/${att.clientId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] hover:text-[#C89543] transition-colors shadow-2xs"
                    >
                      <span>{isEn ? 'Open Case Desk' : 'Abrir Mesa do Advogado'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
