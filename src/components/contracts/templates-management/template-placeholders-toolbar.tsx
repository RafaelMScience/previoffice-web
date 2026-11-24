'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { TEMPLATE_PLACEHOLDERS } from '@/lib/utils/template-engine';

interface TemplatePlaceholdersToolbarProps {
  onInsertTag: (tag: string) => void;
  locale: string;
}

export function TemplatePlaceholdersToolbar({
  onInsertTag,
  locale,
}: TemplatePlaceholdersToolbarProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#C89543]" />
          <span>
            {isEn
              ? 'Available Smart Tags (Click to insert into text)'
              : 'Tags Inteligentes Disponíveis (Clique para inserir no texto)'}
          </span>
        </label>
        <span className="text-[10px] text-slate-400">
          {isEn
            ? 'Populated automatically during attendance'
            : 'Preenchidas na hora do atendimento'}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
        {TEMPLATE_PLACEHOLDERS.map((ph) => (
          <button
            key={ph.tag}
            type="button"
            onClick={() => onInsertTag(ph.tag)}
            title={`${ph.description} (${isEn ? 'e.g.' : 'Ex:'} ${ph.example})`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-blue-50 border border-slate-300 hover:border-[#0B78D0] text-[10px] font-mono text-slate-700 hover:text-[#0B78D0] transition-colors shadow-2xs cursor-pointer"
          >
            <span>+</span>
            <strong className="text-[#082A52]">{ph.label}:</strong>
            <span>{ph.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
