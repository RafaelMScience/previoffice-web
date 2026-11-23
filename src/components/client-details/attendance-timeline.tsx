'use client';

import React from 'react';
import {
  Clock,
  User,
  Calendar,
  FileText,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import type { Attendance, AttendanceType } from '@/types/attendance';

interface AttendanceTimelineProps {
  attendances: Attendance[];
  onOpenNewAttendance?: () => void;
  onToggleDocumentDelivered?: (attendanceId: string, docId: string) => void;
  onFormalizeContract?: () => void;
}

export function AttendanceTimeline({
  attendances,
  onOpenNewAttendance,
  onToggleDocumentDelivered,
  onFormalizeContract,
}: AttendanceTimelineProps) {
  const { t, locale } = useI18n();

  const getAttendanceTypeLabel = (type: AttendanceType) => {
    switch (type) {
      case 'FIRST_CONSULTATION':
      case 'FIRST_VISIT':
        return {
          label: t.clientDetails.attendanceTypeFirst,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'RETURN':
        return {
          label: t.clientDetails.attendanceTypeReturn,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'RETURN_DOCUMENTS':
        return {
          label: t.clientDetails.attendanceTypeDocs,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'PROCESS_TRACKING':
        return {
          label: t.clientDetails.attendanceTypeProcess,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'GUIDANCE':
      default:
        return {
          label: t.clientDetails.attendanceTypeGuidance,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C89543]" />
            <h2 className="text-lg font-bold text-slate-900">{t.clientDetails.timelineTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.clientDetails.timelineSubtitle}</p>
        </div>

        {onOpenNewAttendance && (
          <button
            onClick={onOpenNewAttendance}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#C89543]" />
            <span>{t.clientDetails.btnNewAttendance}</span>
          </button>
        )}
      </div>

      {/* Timeline items */}
      {attendances.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">{t.clientDetails.noAttendancesYet}</p>
          {onOpenNewAttendance && (
            <button
              onClick={onOpenNewAttendance}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#C89543] hover:underline"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.clientDetails.btnNewAttendance}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 mt-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {attendances.map((item, index) => {
            const { label, badgeColor } = getAttendanceTypeLabel(item.attendanceType);
            const dateObj = new Date(item.attendedAt);
            const isFirst = index === 0;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node dot */}
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

                {/* Card Container */}
                <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl p-5 transition-colors">
                  {/* Top Bar: Date, Attendant and Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}
                      >
                        {label}
                      </span>

                      <span className="text-xs font-bold text-slate-800">
                        {formatBenefitType(item.objective, locale === 'en-US' ? 'en-US' : 'pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateObj.toLocaleDateString('pt-BR')} às{' '}
                        {dateObj.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {item.attendantName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.attendantName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Narrative */}
                  {item.narrativeHistory && (
                    <div className="mb-3 text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      <strong className="block text-slate-900 mb-1 font-semibold">
                        {t.clientDetails.narrativeLabel}
                      </strong>
                      <p className="whitespace-pre-line">{item.narrativeHistory}</p>
                    </div>
                  )}

                  {/* Body: Strategy */}
                  {item.notes && (
                    <div className="mb-3 text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <strong className="block text-amber-900 mb-1 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
                        {t.clientDetails.strategyLabel}
                      </strong>
                      <p className="whitespace-pre-line">{item.notes}</p>
                    </div>
                  )}

                  {/* Pending Documents Checklist */}
                  {item.pendingDocuments && item.pendingDocuments.length > 0 && (
                    <div className="pt-2">
                      <span className="block text-xs font-semibold text-slate-800 mb-2">
                        {t.clientDetails.pendingDocsLabel}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.pendingDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() =>
                              onToggleDocumentDelivered &&
                              onToggleDocumentDelivered(item.id, doc.id)
                            }
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              doc.isDelivered
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                doc.isDelivered ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span
                              className={`truncate ${
                                doc.isDelivered ? 'line-through text-emerald-700' : ''
                              }`}
                            >
                              {doc.description}
                            </span>
                            {doc.isDelivered && (
                              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                {t.clientDetails.docDelivered}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Prompt to close contract when all docs delivered */}
                      {item.pendingDocuments.every((d) => d.isDelivered) && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{t.clientDetails.allDocsCompletedPrompt}</span>
                          </div>
                          {onFormalizeContract && (
                            <button
                              type="button"
                              onClick={onFormalizeContract}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                              <span>{t.clientDetails.btnFormalizeContract}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Physical File Folder */}
                  {item.physicalFileLocation && (
                    <div className="mt-3 pt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.physicalFileLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
