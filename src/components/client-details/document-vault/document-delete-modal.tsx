'use client';

import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { LegalDocument } from '@/types/document';
import type { TeamMember } from '@/types/settings';

interface DocumentDeleteModalProps {
  deletingDoc: LegalDocument | null;
  onClose: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  currentUser: TeamMember | null;
  formatFileSize: (bytes: number) => string;
  locale: string;
}

export function DocumentDeleteModal({
  deletingDoc,
  onClose,
  onConfirmDelete,
  isDeleting,
  currentUser,
  formatFileSize,
  locale,
}: DocumentDeleteModalProps) {
  if (!deletingDoc) return null;
  const isEn = locale === 'en-US';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-rose-500 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Alert Danger */}
        <div className="bg-rose-600 text-white p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-wide uppercase">
              {isEn ? 'Warning: Permanent Deletion' : 'Atenção: Exclusão Permanente'}
            </h3>
            <p className="text-xs text-rose-100 mt-0.5">
              {isEn
                ? 'This action cannot be undone. The file will be destroyed from the vault.'
                : 'Esta ação não poderá ser desfeita. O arquivo será destruído do cofre.'}
            </p>
          </div>
        </div>

        {/* Warning Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-rose-950 block">
              {isEn
                ? 'Document selected for permanent destruction:'
                : 'Documento selecionado para destruição:'}
            </span>
            <div className="text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-rose-200/60">
              <p className="font-bold text-slate-900">{deletingDoc.displayName}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {deletingDoc.originalName} ({formatFileSize(deletingDoc.sizeBytes)})
              </p>
            </div>
          </div>

          {/* Operator Audit Information */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              {isEn ? 'LGPD Security Audit' : 'Auditoria de Segurança (LGPD)'}
            </span>
            <p>
              <strong className="text-slate-700">
                {isEn ? 'Responsible Operator:' : 'Operador responsável:'}
              </strong>{' '}
              <span className="font-semibold text-slate-900">
                {currentUser?.fullName || (isEn ? 'Current User' : 'Usuário Atual')}
              </span>{' '}
              ({currentUser?.email || 'email'})
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isEn
                ? 'The audit log of who deleted this document with exact timestamp is permanently preserved in the database.'
                : 'O registro de quem executou esta exclusão e a data/hora exata serão gravados permanentemente no banco de dados para conformidade jurídica.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Deleting with audit...' : 'Excluindo com auditoria...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Yes, Delete Permanently' : 'Sim, Excluir Definitivamente'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
