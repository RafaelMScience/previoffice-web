'use client';

import React, { useState } from 'react';
import { X, UserX, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

interface InactivateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  onConfirm: (reason: string, notes: string) => void;
}

export function InactivateClientModal({
  isOpen,
  onClose,
  clientName,
  onConfirm,
}: InactivateClientModalProps) {
  const { t } = useI18n();

  const [reason, setReason] = useState('DESISTENCIA');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getReasonText = (code: string) => {
    switch (code) {
      case 'DESISTENCIA':
        return t.clientDetails.inactivationReasonDesistencia;
      case 'CONCESSAO':
        return t.clientDetails.inactivationReasonConcessao;
      case 'INVIABILIDADE':
        return t.clientDetails.inactivationReasonInviabilidade;
      case 'FALECIMENTO':
        return t.clientDetails.inactivationReasonFalecimento;
      case 'TRANSFERENCIA':
        return t.clientDetails.inactivationReasonTransferencia;
      default:
        return code;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm(getReasonText(reason), notes.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <UserX className="w-4 h-4" />
            <span>{t.clientDetails.inactivateModalTitle}</span>
          </div>

          <p className="text-xs text-slate-300">
            {t.clientDetails.inactivateModalSubtitle}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Você está alterando o status de <strong>{clientName}</strong> para inativo/arquivado.
              O histórico de comparecimentos anteriores permanecerá 100% preservado e o cliente
              poderá ser reativado a qualquer momento se retornar ao escritório.
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.inactivationReasonLabel}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
            >
              <option value="DESISTENCIA">
                {t.clientDetails.inactivationReasonDesistencia}
              </option>
              <option value="CONCESSAO">
                {t.clientDetails.inactivationReasonConcessao}
              </option>
              <option value="INVIABILIDADE">
                {t.clientDetails.inactivationReasonInviabilidade}
              </option>
              <option value="FALECIMENTO">
                {t.clientDetails.inactivationReasonFalecimento}
              </option>
              <option value="TRANSFERENCIA">
                {t.clientDetails.inactivationReasonTransferencia}
              </option>
            </select>
          </div>

          {/* Closing Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.inactivationNotesLabel}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.clientDetails.inactivationNotesPlaceholder}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
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
              {t.clientDetails.btnClose}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>{t.clientDetails.btnConfirmInactivation}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
