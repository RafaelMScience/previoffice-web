'use client';

import React, { useState } from 'react';
import {
  Scale,
  PlusCircle,
  Clock,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { NewCaseUpdateModal } from './new-case-update-modal';
import type { CaseUpdate, CaseStage, CaseEventKind } from '@/types/case-update';

interface CaseUpdatesPanelProps {
  clientId: string;
  clientName: string;
  clientPhone?: string;
  initialUpdates: CaseUpdate[];
}

export function CaseUpdatesPanel({
  clientId,
  clientName,
  clientPhone,
  initialUpdates,
}: CaseUpdatesPanelProps) {
  const { t } = useI18n();

  const [updates, setUpdates] = useState<CaseUpdate[]>(initialUpdates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedProcess, setCopiedProcess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentProcessNumber = updates[0]?.processNumber || '0800123-45.2026.4.05.8201';
  const currentAgency = updates[0]?.forumOrAgency || '1ª Vara Federal de Guarabira - JEF';
  const currentStage = updates[0]?.stage || 'JUDICIAL_FIRST_DEGREE';

  const handleCopyProcess = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentProcessNumber);
      setCopiedProcess(true);
      setTimeout(() => setCopiedProcess(false), 2000);
    }
  };

  const handleSaveUpdate = (newUpdate: CaseUpdate) => {
    setUpdates((prev) => [newUpdate, ...prev]);
    showToast(t.caseUpdates.toastUpdateSuccess);
  };

  const handleSendWhatsApp = (text: string) => {
    const cleanPhone = (clientPhone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      alert('Cliente sem telefone/celular cadastrado para envio.');
      return;
    }
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(t.caseUpdates.toastWhatsAppOpened);
  };

  const getEventBadge = (kind: CaseEventKind) => {
    switch (kind) {
      case 'DECISION_GRANTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MEDICAL_EXAM_SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'INSS_EXIGENCE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PAYMENT_ISSUED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DECISION_DENIED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'REQUIREMENT_FILED':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStageLabel = (stage: CaseStage) => {
    switch (stage) {
      case 'ADMINISTRATIVE_INSS':
        return 'INSS Administrativo';
      case 'CRPS_APPEAL':
        return 'Recurso CRPS';
      case 'JUDICIAL_FIRST_DEGREE':
        return 'Justiça Federal (JEF 1ª Instância)';
      case 'JUDICIAL_APPEAL':
        return 'Turma Recursal / TRF';
      case 'EXECUTION_PAYMENT':
        return 'Fase de Execução / Pagamento';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Case Overview Card */}
      <div className="bg-[#0B192E] text-white p-6 rounded-2xl shadow-xs border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase">
            <Scale className="w-4 h-4" />
            <span>{t.caseUpdates.panelTitle}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-base font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
              <span>{currentProcessNumber}</span>
              <button
                onClick={handleCopyProcess}
                className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
                title="Copiar número do processo"
              >
                {copiedProcess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </span>

            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#C89543] text-white font-bold">
              {getStageLabel(currentStage)}
            </span>
          </div>

          <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentAgency}</span>
          </p>
        </div>

        {/* Action Button: Insert Movement */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C89543] hover:bg-[#b08137] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.caseUpdates.btnAddUpdate}</span>
        </button>
      </div>

      {/* Chronological Procedural Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Linha do Tempo de Andamentos Processuais
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhamento de cada despacho, perícia e decisão com emissão direta de avisos no WhatsApp.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {updates.length} andamento(s)
          </span>
        </div>

        {updates.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Scale className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">{t.caseUpdates.noUpdatesYet}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#C89543] hover:underline"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.caseUpdates.btnAddUpdate}</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {updates.map((item, index) => {
              const isLatest = index === 0;
              const dateObj = new Date(item.eventDate);

              return (
                <div key={item.id} className="relative group">
                  {/* Node Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isLatest
                        ? 'bg-[#C89543] border-[#0B192E] text-white shadow-xs'
                        : 'bg-white border-slate-300 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isLatest ? 'bg-white' : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  {/* Card Container */}
                  <div
                    className={`border rounded-xl p-5 transition-colors ${
                      isLatest
                        ? 'bg-amber-50/20 border-amber-200/80'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    {/* Top Row: Type Badge, Agency and Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getEventBadge(
                            item.eventKind
                          )}`}
                        >
                          {item.title}
                        </span>

                        {isLatest && (
                          <span className="text-[10px] uppercase font-bold bg-[#0B192E] text-white px-2 py-0.5 rounded-md">
                            {t.caseUpdates.latestUpdateBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {dateObj.toLocaleDateString('pt-BR')}
                        </span>
                        <span>•</span>
                        <span>{item.recordedBy}</span>
                      </div>
                    </div>

                    {/* Technical Description */}
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line mb-3 font-sans">
                      {item.description}
                    </p>

                    {/* Deadline (if any) */}
                    {item.actionDeadline && (
                      <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {t.caseUpdates.deadlineLabel}:{' '}
                          {new Date(item.actionDeadline).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {/* WhatsApp Notification Box */}
                    {item.notifyClientText && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Mensagem Pronta para o Cliente (WhatsApp):
                          </span>
                          <p className="text-xs text-emerald-950 font-medium italic">
                            &quot;{item.notifyClientText}&quot;
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(item.notifyClientText!)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t.caseUpdates.btnSendWhatsAppUpdate}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      <NewCaseUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={clientId}
        clientName={clientName}
        defaultProcessNumber={currentProcessNumber}
        onSave={handleSaveUpdate}
      />
    </div>
  );
}
