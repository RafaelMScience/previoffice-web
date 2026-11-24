'use client';

import React from 'react';
import { Layers, Eye, Edit3 } from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';
import type { GeneratedDocItem } from '../legal-contract-modal';

export interface ContractDocumentListProps {
  t: Translations;
  availableDocuments: GeneratedDocItem[];
  focusedDocId: string;
  setFocusedDocId: (id: string) => void;
  onToggleKitItem: (docId: string) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}

export function ContractDocumentList({
  t,
  availableDocuments,
  focusedDocId,
  setFocusedDocId,
  onToggleKitItem,
  isEditing,
  setIsEditing,
}: ContractDocumentListProps) {
  const cd = t.clientDetails;

  return (
    <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col h-full overflow-hidden transition-all duration-200">
      <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Layers className="w-4 h-4 text-[#C89543]" />
          <span>{cd.linkedDocumentsTitle}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
          {cd.availableDocsBadge.replace('{count}', String(availableDocuments.length))}
        </span>
      </div>

      {/* Lista Vertical de Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        {availableDocuments.map((doc, idx) => {
          const isActive = doc.id === focusedDocId;
          return (
            <div
              key={doc.id}
              onClick={() => setFocusedDocId(doc.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-[#082A52] border-[#C89543] shadow-md ring-2 ring-[#C89543]/30'
                  : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={doc.isIncludedInKit}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleKitItem(doc.id);
                    }}
                    className="w-4 h-4 accent-[#C89543] rounded cursor-pointer"
                    title={cd.inEmissionKit}
                  />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#C89543]">
                    {idx + 1}. {doc.categoryLabel}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{cd.inFocusBadge}</span>
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{doc.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{doc.description}</p>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {doc.isIncludedInKit ? cd.inEmissionKit : cd.notInEmissionKit}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedDocId(doc.id);
                    setIsEditing(!isEditing);
                  }}
                  className="text-[#C89543] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{cd.btnEditText}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
