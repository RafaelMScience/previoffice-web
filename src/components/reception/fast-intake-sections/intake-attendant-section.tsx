'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { TeamMember } from '@/types/settings';

interface IntakeAttendantSectionProps {
  isManagingPartner: boolean;
  createdById: string;
  onCreatedByIdChange: (id: string) => void;
  assignedLawyerId: string;
  onAssignedLawyerIdChange: (id: string) => void;
  dbMembers: TeamMember[];
  lawyerOptions: TeamMember[];
  currentUser: TeamMember | null;
  locale: string;
}

export function IntakeAttendantSection({
  isManagingPartner,
  createdById,
  onCreatedByIdChange,
  assignedLawyerId,
  onAssignedLawyerIdChange,
  dbMembers,
  lawyerOptions,
  currentUser,
  locale,
}: IntakeAttendantSectionProps) {
  const isEn = locale === 'en-US';

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            {isEn ? 'Registered by' : 'Cadastrado por'}
          </label>
          {isManagingPartner ? (
            <select
              value={createdById}
              onChange={(e) => onCreatedByIdChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-[#C89543]"
            >
              {dbMembers.length > 0 ? (
                dbMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} {m.id === currentUser?.id ? (isEn ? '(You)' : '(Você)') : ''}
                  </option>
                ))
              ) : (
                <option value={currentUser?.id || ''}>
                  {currentUser?.fullName || (isEn ? 'You' : 'Você')}
                </option>
              )}
            </select>
          ) : (
            <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {currentUser?.fullName || (isEn ? 'Logged-in Operator' : 'Operador Logado')}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-800 mb-1">
            {isEn ? 'Attending Lawyer' : 'Advogado que irá atender'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={assignedLawyerId}
            onChange={(e) => onAssignedLawyerIdChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#082A52] rounded-lg font-bold text-[#082A52] focus:ring-1 focus:ring-[#C89543]"
          >
            {lawyerOptions.map((lawyer) => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.fullName} {lawyer.oabNumber ? `(${lawyer.oabNumber})` : ''}{' '}
                {lawyer.id === currentUser?.id ? (isEn ? '(You)' : '(Você)') : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 leading-tight">
        {isManagingPartner
          ? isEn
            ? 'As a Partner, you can choose who recorded this and assign any attorney.'
            : 'Como Sócio, você pode escolher o cadastrador e definir qualquer advogado para o atendimento.'
          : isEn
          ? 'Recorded under your login. You can select which firm attorney will conduct the consultation.'
          : 'Cadastrador fixo com seu login. Você pode escolher qual advogado da banca irá realizar o atendimento.'}
      </p>
    </div>
  );
}
