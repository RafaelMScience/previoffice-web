'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  User,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { settingsStore } from '@/lib/data/mock-settings';
import type { Attendance, AttendanceType, PendingPhysicalDocument } from '@/types/attendance';

interface NewAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  defaultObjective?: string;
  onSave: (attendance: Attendance) => void;
}

export function NewAttendanceModal({
  isOpen,
  onClose,
  clientId,
  defaultObjective = 'Aposentadoria Rural - Segurado Especial',
  onSave,
}: NewAttendanceModalProps) {
  const { t } = useI18n();

  const [attendanceType, setAttendanceType] = useState<AttendanceType>('RETURN');
  const teamMembers = settingsStore.getTeamMembers();
  const activeLawyers = settingsStore.getActiveLawyers();
  const [createdById, setCreatedById] = useState<string>('usr-001'); // Dr. Alexandre Pontes
  const [assignedLawyerId, setAssignedLawyerId] = useState<string>('usr-001'); // Dr. Alexandre Pontes
  const [objective, setObjective] = useState(defaultObjective);
  const [narrativeHistory, setNarrativeHistory] = useState('');
  const [strategyNotes, setStrategyNotes] = useState('');
  const [pendingDocs, setPendingDocs] = useState<PendingPhysicalDocument[]>([
    { id: '1', description: 'Extrato de CNIS atualizado', isDelivered: false },
    { id: '2', description: 'Comprovante de Residência recente', isDelivered: true },
  ]);
  const [newDocText, setNewDocText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddDoc = () => {
    if (!newDocText.trim()) return;
    setPendingDocs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        description: newDocText.trim(),
        isDelivered: false,
      },
    ]);
    setNewDocText('');
  };

  const handleToggleDoc = (id: string) => {
    setPendingDocs((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, isDelivered: !doc.isDelivered } : doc
      )
    );
  };

  const handleRemoveDoc = (id: string) => {
    setPendingDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const creator = teamMembers.find((m) => m.id === createdById);
    const lawyer = activeLawyers.find((m) => m.id === assignedLawyerId);
    const attendantDisplayName =
      creator?.id === lawyer?.id
        ? lawyer?.fullName || 'Dr. Alexandre Pontes'
        : `${creator?.fullName || 'Recepção'} (Atendido por ${lawyer?.fullName || 'Advogado'})`;

    const newAttendance: Attendance = {
      id: Math.random().toString(36).slice(2, 11),
      tenantId: 'tenant-default',
      clientId,
      attendanceType,
      attendedAt: new Date().toISOString(),
      objective,
      narrativeHistory: narrativeHistory.trim() || undefined,
      notes: strategyNotes.trim() || undefined,
      attendantName: attendantDisplayName,
      pendingDocuments: pendingDocs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newAttendance);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Clock className="w-4 h-4" />
            <span>{t.clientDetails.modalAttendanceTitle}</span>
          </div>

          <p className="text-xs text-slate-300">
            {t.clientDetails.modalAttendanceSubtitle}
          </p>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.clientDetails.attendanceTypeLabel}
              </label>
              <select
                value={attendanceType}
                onChange={(e) => setAttendanceType(e.target.value as AttendanceType)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
              >
                <option value="RETURN">{t.clientDetails.attendanceTypeReturn}</option>
                <option value="RETURN_DOCUMENTS">{t.clientDetails.attendanceTypeDocs}</option>
                <option value="PROCESS_TRACKING">{t.clientDetails.attendanceTypeProcess}</option>
                <option value="FIRST_CONSULTATION">{t.clientDetails.attendanceTypeFirst}</option>
                <option value="GUIDANCE">{t.clientDetails.attendanceTypeGuidance}</option>
              </select>
            </div>

            {/* Registrado por (Criador) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registrado por (Início do Atendimento)
              </label>
              <select
                value={createdById}
                onChange={(e) => {
                  const newCreatedId = e.target.value;
                  setCreatedById(newCreatedId);
                  const member = teamMembers.find((m) => m.id === newCreatedId);
                  if (member?.memberType === 'LAWYER') {
                    setAssignedLawyerId(newCreatedId);
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberType === 'LAWYER' ? 'Advogado' : m.memberType === 'ASSISTANT' ? 'Assistente' : 'Estagiário'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advogado Responsável pelo Atendimento */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Advogado Responsável pelo Atendimento <span className="text-rose-500">*</span>
              </label>
              {teamMembers.find((m) => m.id === createdById)?.memberType !== 'LAWYER' && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Atribuição obrigatória (Operador não-advogado)
                </span>
              )}
            </div>
            <select
              required
              value={assignedLawyerId}
              onChange={(e) => setAssignedLawyerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#082A52] rounded-lg font-bold text-[#082A52] focus:ring-2 focus:ring-[#C89543]"
            >
              {activeLawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.fullName} ({lawyer.oabNumber})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {teamMembers.find((m) => m.id === createdById)?.memberType === 'LAWYER'
                ? 'Advogados podem atender diretamente ou transferir para outro colega da banca.'
                : 'Assistentes e estagiários devem obrigatoriamente indicar o advogado que conduzirá o atendimento.'}
            </p>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.objectiveLabel}
            </label>
            <input
              type="text"
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-semibold text-[#0B192E]"
            />
          </div>

          {/* Narrative */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.narrativeLabel}
            </label>
            <textarea
              rows={3}
              value={narrativeHistory}
              onChange={(e) => setNarrativeHistory(e.target.value)}
              placeholder={t.clientDetails.narrativeNotesPlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{t.clientDetails.strategyLabel}</span>
            </label>
            <textarea
              rows={2}
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              placeholder={t.clientDetails.strategyNotesPlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-amber-50/50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
            />
          </div>

          {/* Pending documents checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {t.clientDetails.pendingDocsLabel}
            </label>

            {/* Input to add */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newDocText}
                onChange={(e) => setNewDocText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDoc();
                  }
                }}
                placeholder={t.clientDetails.addDocChecklistItem}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-1.5">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={doc.isDelivered}
                      onChange={() => handleToggleDoc(doc.id)}
                      className="rounded text-[#C89543] focus:ring-[#C89543] w-4 h-4 cursor-pointer"
                    />
                    <span className={doc.isDelivered ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {doc.description}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t.clientDetails.btnClose}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? t.clientDetails.btnSavingAttendance
                : t.clientDetails.btnSaveAttendance}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
