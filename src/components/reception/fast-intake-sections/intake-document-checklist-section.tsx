'use client';

import React from 'react';
import { FileText, Trash2, Plus } from 'lucide-react';
import {
  COMMON_DOCUMENT_SHORTCUTS,
  type DocumentChecklistItem,
} from '@/lib/domain/document-presets';

interface IntakeDocumentChecklistSectionProps {
  documents: DocumentChecklistItem[];
  onToggleSelectDoc: (id: string) => void;
  onToggleDeliveredDoc: (id: string, isDelivered: boolean) => void;
  onRemoveDoc: (id: string) => void;
  onSelectAllDocs: () => void;
  onDeselectAllDocs: () => void;
  onAddCustomDoc: (name: string) => void;
  customDocName: string;
  setCustomDocName: (val: string) => void;
  locale: string;
}

export function IntakeDocumentChecklistSection({
  documents,
  onToggleSelectDoc,
  onToggleDeliveredDoc,
  onRemoveDoc,
  onSelectAllDocs,
  onDeselectAllDocs,
  onAddCustomDoc,
  customDocName,
  setCustomDocName,
  locale,
}: IntakeDocumentChecklistSectionProps) {
  const isEn = locale === 'en-US';

  const selectedCount = documents.filter((d) => d.isSelected).length;
  const pendingCount = documents.filter((d) => d.isSelected && !d.isDelivered).length;

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C89543]" />
          <span className="text-xs font-bold text-slate-800">
            {isEn ? 'Attendance Documents' : 'Documentos do Atendimento'}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {selectedCount} {isEn ? 'required' : 'exigido(s)'}
            {pendingCount > 0
              ? ` • ${pendingCount} ${isEn ? 'pending' : 'pendente(s)'}`
              : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAllDocs}
            className="text-[11px] font-medium text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
          >
            {isEn ? 'Select All' : 'Marcar Todos'}
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onDeselectAllDocs}
            className="text-[11px] font-medium text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
          >
            {isEn ? 'No Documents' : 'Nenhum Documento'}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-tight">
        {isEn
          ? 'Check documents required for this attendance. Mark as Received if already presented, or Pending if delivery is pending.'
          : 'Marque os documentos que serão cobrados neste atendimento. Defina como Recebido se o cliente já trouxe, ou Pendente caso precise entregar depois.'}
      </p>

      {/* Checklist items list */}
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
        {documents.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            {isEn
              ? 'No documents added for this attendance.'
              : 'Nenhum documento adicionado para este atendimento.'}
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className={`pt-2 first:pt-0 flex items-center justify-between gap-2 p-2 rounded-lg transition-all ${
                doc.isSelected
                  ? 'bg-white border border-slate-200 shadow-2xs'
                  : 'bg-slate-100/70 border border-dashed border-slate-200 opacity-60'
              }`}
            >
              {/* Checkbox + Label */}
              <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={doc.isSelected}
                  onChange={() => onToggleSelectDoc(doc.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 shrink-0 cursor-pointer"
                />
                <span
                  className={`text-xs truncate ${
                    doc.isSelected
                      ? 'font-semibold text-slate-800'
                      : 'text-slate-400 line-through'
                  }`}
                  title={doc.description}
                >
                  {doc.description}
                </span>
              </label>

              {/* Action / Status Toggle & Remove */}
              <div className="flex items-center gap-1.5 shrink-0">
                {doc.isSelected ? (
                  <div className="inline-flex rounded-md shadow-2xs border border-slate-200 overflow-hidden bg-slate-50 p-0.5 text-[11px]">
                    <button
                      type="button"
                      aria-pressed={doc.isDelivered}
                      onClick={() => onToggleDeliveredDoc(doc.id, true)}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        doc.isDelivered
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {isEn ? '✓ Received' : '✓ Recebido'}
                    </button>
                    <button
                      type="button"
                      aria-pressed={!doc.isDelivered}
                      onClick={() => onToggleDeliveredDoc(doc.id, false)}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        !doc.isDelivered
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {isEn ? '⏳ Pending' : '⏳ Pendente'}
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic px-1.5">
                    {isEn ? 'Not required' : 'Não exigido'}
                  </span>
                )}

                {/* Trash button to completely remove from list */}
                <button
                  type="button"
                  onClick={() => onRemoveDoc(doc.id)}
                  aria-label={`${isEn ? 'Remove document' : 'Remover documento'} ${doc.description}`}
                  title={isEn ? 'Remove document from list' : 'Remover documento da lista'}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Document Shortcuts */}
      <div className="pt-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          {isEn ? 'Quick shortcuts to add:' : 'Atalhos rápidos para adicionar:'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_DOCUMENT_SHORTCUTS.map((shortcut) => {
            const isAlreadyAdded = documents.some(
              (d) => d.description.toLowerCase() === shortcut.toLowerCase() && d.isSelected
            );
            return (
              <button
                key={shortcut}
                type="button"
                onClick={() => onAddCustomDoc(shortcut)}
                disabled={isAlreadyAdded}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isAlreadyAdded
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                + {shortcut}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input to type custom document */}
      <div className="flex gap-1.5 pt-1">
        <input
          type="text"
          value={customDocName}
          aria-label={isEn ? 'Type custom document' : 'Digitar outro documento'}
          onChange={(e) => setCustomDocName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddCustomDoc(customDocName);
            }
          }}
          placeholder={isEn ? 'Type another document (e.g. Marriage Certificate)...' : 'Digitar outro documento (ex: Certidão de Casamento)...'}
          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
        />
        <button
          type="button"
          onClick={() => onAddCustomDoc(customDocName)}
          className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isEn ? 'Add' : 'Adicionar'}</span>
        </button>
      </div>
    </div>
  );
}
