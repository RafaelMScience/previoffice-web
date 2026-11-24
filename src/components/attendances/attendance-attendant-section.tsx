'use client';

import React from 'react';
import type { AttendanceType } from '@/types/attendance';
import type { TeamMember } from '@/types/settings';
import type { Translations } from '@/lib/i18n/types';

export interface AttendanceAttendantSectionProps {
  t: Translations;
  attendanceType: AttendanceType;
  setAttendanceType: (val: AttendanceType) => void;
  createdById: string;
  setCreatedById: (id: string) => void;
  assignedLawyerId: string;
  setAssignedLawyerId: (id: string) => void;
  teamMembers: TeamMember[];
  lawyerOptions: TeamMember[];
  currentUserId?: string;
}

export function AttendanceAttendantSection({
  t,
  attendanceType,
  setAttendanceType,
  createdById,
  setCreatedById,
  assignedLawyerId,
  setAssignedLawyerId,
  teamMembers,
  lawyerOptions,
  currentUserId,
}: AttendanceAttendantSectionProps) {
  const cd = t.clientDetails;
  const isCreatorNonLawyer = teamMembers.find((m) => m.id === createdById)?.memberType !== 'LAWYER';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tipo de Atendimento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cd.attendanceTypeLabel}
          </label>
          <select
            value={attendanceType}
            onChange={(e) => setAttendanceType(e.target.value as AttendanceType)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
          >
            <option value="RETURN">{cd.attendanceTypeReturn}</option>
            <option value="RETURN_DOCUMENTS">{cd.attendanceTypeDocs}</option>
            <option value="PROCESS_TRACKING">{cd.attendanceTypeProcess}</option>
            <option value="FIRST_CONSULTATION">{cd.attendanceTypeFirst}</option>
            <option value="GUIDANCE">{cd.attendanceTypeGuidance}</option>
          </select>
        </div>

        {/* Registrado por (Início do Atendimento) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cd.registeredByLabel}
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
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.memberType === 'LAWYER' ? 'Advogado' : m.memberType === 'ASSISTANT' ? 'Assistente' : 'Estagiário'})
                {currentUserId === m.id ? ' ★ (Você)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advogado Responsável pelo Atendimento */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-800">
            {cd.responsibleLawyerLabel} <span className="text-rose-500">*</span>
          </label>
          {isCreatorNonLawyer && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              {cd.mandatoryLawyerAssignment}
            </span>
          )}
        </div>
        <select
          required
          value={assignedLawyerId}
          onChange={(e) => setAssignedLawyerId(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-white border border-[#082A52] rounded-lg font-bold text-[#082A52] focus:ring-2 focus:ring-[#C89543]"
        >
          {lawyerOptions.map((lawyer) => (
            <option key={lawyer.id} value={lawyer.id}>
              {lawyer.fullName} ({lawyer.oabNumber || 'OAB'})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 mt-1">
          {isCreatorNonLawyer
            ? cd.lawyerAssignmentHelpStaff
            : cd.lawyerAssignmentHelpLawyer}
        </p>
      </div>
    </div>
  );
}
