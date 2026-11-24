'use client';

import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';
import type { DocumentChecklistItem } from '@/lib/domain/document-presets';
import { COMMON_DOCUMENT_SHORTCUTS } from '@/lib/domain/document-presets';

export interface AttendanceChecklistSectionProps {
  t: Translations;
  documents: DocumentChecklistItem[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleSelectDoc: (id: string) => void;
  onToggleDeliveredDoc: (id: string, isDelivered: boolean) => void;
  onRemoveDoc: (id: string) => void;
  onAddCustomDoc: (name: string) => void;
  customDocName: string;
  setCustomDocName: (name: string) => void;
}

export function AttendanceChecklistSection({
  t,
  documents,
  onSelectAll,
  onDeselectAll,
  onToggleSelectDoc,
  onToggleDeliveredDoc,
  onRemoveDoc,
  onAddCustomDoc,
  customDocName,
  setCustomDocName,
}: AttendanceChecklistSectionProps) {
  const cd = t.clientDetails;
  const totalExigidos = documents.filter((d) => d.isSelected).length;
  const totalPendentes = documents.filter((d) => d.isSelected && !d.isDelivered).length;

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C89543]" />
          <span className="text-xs font-bold text-slate-800">
            {cd.attendanceDocsTitle}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {cd.docsRequiredCount.replace('{count}', String(totalExigidos))}
            {totalPendentes > 0 ? ` • ${cd.docsPendingCount.replace('{count}', String(totalPendentes))}` : ' • 0 pendente(s)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[11px] font-medium text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
          >
            {cd.selectAllDocs}
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-[11px] font-medium text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
          >
            {cd.clearAllDocs}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-tight">
        {cd.attendanceDocsHelp}
      </p>

      {/* Checklist de Documentos */}
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
        {documents.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            {cd.noDocsAdded}
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
                      {cd.docStatusReceived}
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
                      {cd.docStatusPending}
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic px-1.5">
                    {cd.docStatusNotRequired}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveDoc(doc.id)}
                  aria-label={`Remover documento ${doc.description} da lista`}
                  title="Remover documento da lista"
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Atalhos Rápidos para Adicionar */}
      <div className="pt-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          {cd.quickShortcutsTitle}
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

      {/* Input para Digitar Outro Documento */}
      <div className="flex gap-1.5 pt-1">
        <input
          type="text"
          value={customDocName}
          aria-label={cd.customDocPlaceholder}
          onChange={(e) => setCustomDocName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddCustomDoc(customDocName);
            }
          }}
          placeholder={cd.customDocPlaceholder}
          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
        />
        <button
          type="button"
          onClick={() => onAddCustomDoc(customDocName)}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#152a4a] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{cd.btnAddDoc}</span>
        </button>
      </div>
    </div>
  );
}
