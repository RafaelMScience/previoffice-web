'use client';

import React from 'react';
import { Scale, User, GraduationCap, CheckCircle2 } from 'lucide-react';
import type { MemberType } from '@/types/settings';

interface TeamRoleSelectorProps {
  memberType: MemberType;
  onChange: (type: MemberType) => void;
  locale: string;
}

export function TeamRoleSelector({
  memberType,
  onChange,
  locale,
}: TeamRoleSelectorProps) {
  const isEn = locale === 'en-US';

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        {isEn ? 'Member Classification' : 'Classificação do Membro'}{' '}
        <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-3">
        {/* Lawyer */}
        <button
          type="button"
          onClick={() => onChange('LAWYER')}
          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
            memberType === 'LAWYER'
              ? 'border-[#082A52] bg-[#082A52]/5 text-[#082A52] ring-1 ring-[#082A52]'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Scale
              className={`w-4 h-4 ${
                memberType === 'LAWYER' ? 'text-[#C89543]' : 'text-slate-400'
              }`}
            />
            {memberType === 'LAWYER' && <CheckCircle2 className="w-4 h-4 text-[#082A52]" />}
          </div>
          <span className="text-xs font-bold">{isEn ? 'Lawyer' : 'Advogado'}</span>
          <span className="text-[10px] text-slate-500">
            {isEn ? 'Has Bar registration & signs cases' : 'Possui OAB e assina peças'}
          </span>
        </button>

        {/* Assistant */}
        <button
          type="button"
          onClick={() => onChange('ASSISTANT')}
          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
            memberType === 'ASSISTANT'
              ? 'border-[#082A52] bg-[#082A52]/5 text-[#082A52] ring-1 ring-[#082A52]'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <User
              className={`w-4 h-4 ${
                memberType === 'ASSISTANT' ? 'text-[#C89543]' : 'text-slate-400'
              }`}
            />
            {memberType === 'ASSISTANT' && <CheckCircle2 className="w-4 h-4 text-[#082A52]" />}
          </div>
          <span className="text-xs font-bold">{isEn ? 'Assistant' : 'Assistente'}</span>
          <span className="text-[10px] text-slate-500">
            {isEn ? 'Front-desk & fast triage' : 'Recepção e triagem inicial'}
          </span>
        </button>

        {/* Intern */}
        <button
          type="button"
          onClick={() => onChange('INTERN')}
          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
            memberType === 'INTERN'
              ? 'border-[#082A52] bg-[#082A52]/5 text-[#082A52] ring-1 ring-[#082A52]'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <GraduationCap
              className={`w-4 h-4 ${
                memberType === 'INTERN' ? 'text-[#C89543]' : 'text-slate-400'
              }`}
            />
            {memberType === 'INTERN' && <CheckCircle2 className="w-4 h-4 text-[#082A52]" />}
          </div>
          <span className="text-xs font-bold">{isEn ? 'Intern' : 'Estagiário'}</span>
          <span className="text-[10px] text-slate-500">
            {isEn ? 'Case research & drafting support' : 'Apoio a processos e minutas'}
          </span>
        </button>
      </div>
    </div>
  );
}
