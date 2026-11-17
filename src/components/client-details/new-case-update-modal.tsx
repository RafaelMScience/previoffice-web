'use client';

import React, { useState } from 'react';
import {
  X,
  Scale,
  Sparkles,
  MessageCircle,
  Calendar,
  Clock,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { CaseUpdate, CaseStage, CaseEventKind } from '@/types/case-update';

interface NewCaseUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  defaultProcessNumber?: string;
  onSave: (update: CaseUpdate) => void;
}

export function NewCaseUpdateModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  defaultProcessNumber = '0800123-45.2026.4.05.8201',
  onSave,
}: NewCaseUpdateModalProps) {
  const { t } = useI18n();

  const [processNumber, setProcessNumber] = useState(defaultProcessNumber);
  const [forumOrAgency, setForumOrAgency] = useState('1ª Vara Federal de Guarabira - JEF');
  const [stage, setStage] = useState<CaseStage>('JUDICIAL_FIRST_DEGREE');
  const [eventKind, setEventKind] = useState<CaseEventKind>('MEDICAL_EXAM_SCHEDULED');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('Perícia Médica Judicial Agendada');
  const [description, setDescription] = useState(
    'Designada perícia médica na especialidade ortopedia para o dia 12/12/2026 às 09:30 no consultório judicial em Guarabira.'
  );
  const [actionDeadline, setActionDeadline] = useState('2026-12-05');
  const [notifyClientText, setNotifyClientText] = useState(
    `Olá ${clientName}! Aqui é do escritório do Dr. Alexandre Pontes. Passando para avisar que sua perícia médica foi agendada para o dia 12/12 às 09:30. Estamos preparando tudo e entraremos em contato com as orientações!`
  );
  const [recordedBy, setRecordedBy] = useState('Dr. Alexandre Pontes');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEventKindChange = (newKind: CaseEventKind) => {
    setEventKind(newKind);

    // Auto-suggest title, description, and WhatsApp non-jargon message
    switch (newKind) {
      case 'MEDICAL_EXAM_SCHEDULED':
        setTitle('Perícia Médica Agendada');
        setDescription('Designada perícia médica para avaliação de incapacidade laborativa.');
        setNotifyClientText(
          `Olá ${clientName}! Passando para avisar que sua perícia médica foi agendada. Estamos cuidando de todos os detalhes e logo passaremos as orientações!`
        );
        break;
      case 'DECISION_GRANTED':
        setTitle('Decisão Favorável / Benefício Concedido');
        setDescription('Sentença de procedência proferida pelo Juízo, reconhecendo o direito ao benefício.');
        setNotifyClientText(
          `Ótima notícia ${clientName}! Tivemos uma decisão muito favorável no seu processo! O seu benefício foi reconhecido e estamos cuidando da implantação!`
        );
        break;
      case 'INSS_EXIGENCE':
        setTitle('Exigência Notificada pelo INSS');
        setDescription('Notificação para apresentação de documento complementar no prazo legal.');
        setNotifyClientText(
          `Olá ${clientName}! O INSS fez um pedido de conferência no seu processo. Já estamos cuidando da resposta dentro do prazo para a senhora ficar tranquila.`
        );
        break;
      case 'PAYMENT_ISSUED':
        setTitle('Expedição de RPV / Precatório de Atrasados');
        setDescription('Expedida Requisição de Pequeno Valor (RPV) para liberação dos valores retroativos devidos.');
        setNotifyClientText(
          `Olá ${clientName}! O documento para liberação dos seus valores atrasados (RPV) já foi expedido. Em breve informaremos a data de saque na agência bancária!`
        );
        break;
      case 'REQUIREMENT_FILED':
        setTitle('Requerimento Inicial Protocolado com Sucesso');
        setDescription('Petição inicial e documentos protocolados perante a autoridade competente.');
        setNotifyClientText(
          `Olá ${clientName}! O seu processo já foi protocolado oficialmente. Já temos o comprovante e estamos acompanhando cada passo!`
        );
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newUpdate: CaseUpdate = {
      id: `case-up-${Date.now()}`,
      tenantId: 'tenant-default',
      clientId,
      processNumber: processNumber.trim() || undefined,
      forumOrAgency: forumOrAgency.trim(),
      stage,
      eventKind,
      eventDate: new Date(eventDate).toISOString(),
      title: title.trim(),
      description: description.trim(),
      actionDeadline: actionDeadline ? new Date(actionDeadline).toISOString() : undefined,
      notifyClientText: notifyClientText.trim() || undefined,
      recordedBy: recordedBy.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newUpdate);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Scale className="w-4 h-4" />
            <span>{t.caseUpdates.modalTitle}</span>
          </div>

          <p className="text-xs text-slate-300">
            {t.caseUpdates.modalSubtitle}
          </p>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Row 1: Process Number & Agency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formProcessNumber}
              </label>
              <input
                type="text"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
                placeholder={t.caseUpdates.formProcessPlaceholder}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formAgency}
              </label>
              <input
                type="text"
                required
                value={forumOrAgency}
                onChange={(e) => setForumOrAgency(e.target.value)}
                placeholder={t.caseUpdates.formAgencyPlaceholder}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Stage & Movement Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formStage}
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CaseStage)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-medium"
              >
                <option value="ADMINISTRATIVE_INSS">INSS Administrativo (Agência / Meu INSS)</option>
                <option value="CRPS_APPEAL">Recurso Administrativo (CRPS)</option>
                <option value="JUDICIAL_FIRST_DEGREE">Justiça Federal / JEF (1ª Instância)</option>
                <option value="JUDICIAL_APPEAL">Turma Recursal / TRF (2ª Instância)</option>
                <option value="EXECUTION_PAYMENT">Fase de Execução / RPV / Precatório</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formEventKind}
              </label>
              <select
                value={eventKind}
                onChange={(e) => handleEventKindChange(e.target.value as CaseEventKind)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-medium text-[#0B192E]"
              >
                <option value="MEDICAL_EXAM_SCHEDULED">Perícia Médica Agendada</option>
                <option value="DECISION_GRANTED">Sentença Favorável / Benefício Concedido</option>
                <option value="REQUIREMENT_FILED">Protocolo Inicial do Requerimento / Ação</option>
                <option value="INSS_EXIGENCE">Exigência / Prazo de Cumprimento</option>
                <option value="MEDICAL_REPORT_FILED">Laudo Pericial Juntado</option>
                <option value="PAYMENT_ISSUED">Expedição de RPV / Pagamento</option>
                <option value="DECISION_DENIED">Indeferimento / Decisão Desfavorável</option>
                <option value="GENERAL_UPDATE">Outro Despacho / Andamento Geral</option>
              </select>
            </div>
          </div>

          {/* Row 3: Date & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formDate}
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formTitle}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.caseUpdates.formTitlePlaceholder}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Technical Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.caseUpdates.formDescription}
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.caseUpdates.formDescriptionPlaceholder}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white"
            />
          </div>

          {/* Deadline & Lawyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.caseUpdates.formDeadline}</span>
              </label>
              <input
                type="date"
                value={actionDeadline}
                onChange={(e) => setActionDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.caseUpdates.formRecordedBy}
              </label>
              <input
                type="text"
                required
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white"
              />
            </div>
          </div>

          {/* Friendly WhatsApp text */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.caseUpdates.formWhatsAppText}</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-medium">
                {t.caseUpdates.formWhatsAppHelp}
              </span>
            </div>
            <textarea
              rows={3}
              value={notifyClientText}
              onChange={(e) => setNotifyClientText(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Scale className="w-3.5 h-3.5 text-[#C89543]" />
              <span>
                {isSubmitting
                  ? t.caseUpdates.btnSavingUpdate
                  : t.caseUpdates.btnSaveUpdate}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
