'use client';

import React from 'react';
import {
  Scale,
  User,
  GraduationCap,
  Shield,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
} from 'lucide-react';
import type { TeamMember } from '@/types/settings';

interface TeamMemberRowProps {
  member: TeamMember;
  onToggleActive: (id: string) => void;
  onResetAndShare: (member: TeamMember) => void;
  onOpenEdit: (member: TeamMember) => void;
  formatLastLogin: (isoString?: string) => string;
  locale: string;
}

export function TeamMemberRow({
  member,
  onToggleActive,
  onResetAndShare,
  onOpenEdit,
  formatLastLogin,
  locale,
}: TeamMemberRowProps) {
  const isEn = locale === 'en-US';

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      {/* Member Name + Avatar */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#082A52] to-[#0B192E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {member.fullName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="font-bold text-slate-900">{member.fullName}</div>
            <div className="text-[11px] text-slate-500">{member.email}</div>
          </div>
        </div>
      </td>

      {/* Classification Type */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1 items-start">
          {member.memberType === 'LAWYER' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20">
              <Scale className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{isEn ? 'Lawyer' : 'Advogado'}</span>
              {member.oabNumber && (
                <span className="text-[10px] font-mono text-slate-600">({member.oabNumber})</span>
              )}
            </div>
          ) : member.memberType === 'ASSISTANT' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEn ? 'Assistant' : 'Assistente'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Intern' : 'Estagiário'}</span>
            </div>
          )}

          {member.isAdminLawyer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Shield className="w-3 h-3 text-amber-700" />
              <span>{isEn ? 'Managing Partner' : 'Sócio Admin'}</span>
            </span>
          )}
        </div>
      </td>

      {/* Permissions tags */}
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {member.permissions.adminSettings && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Admin
            </span>
          )}
          {member.permissions.securityAudit && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C89543]/15 text-[#8C6218] border border-[#C89543]/30">
              {isEn ? 'Audit (LGPD)' : 'Auditoria (LGPD)'}
            </span>
          )}
          {member.permissions.receptionDesk && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {isEn ? 'Reception' : 'Recepção'}
            </span>
          )}
          {member.permissions.clientsManage && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {isEn ? 'Clients' : 'Clientes'}
            </span>
          )}
          {member.permissions.casesManage && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {isEn ? 'Cases' : 'Processos'}
            </span>
          )}
          {member.permissions.contractsAndFinancial && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isEn ? 'Fees' : 'Honorários'}
            </span>
          )}
          {member.permissions.templatesManage && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {isEn ? 'Drafts' : 'Minutas'}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <button
          onClick={() => onToggleActive(member.id)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
            member.active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
          }`}
          title={isEn ? 'Click to toggle active status' : 'Clique para alternar o status'}
        >
          {member.active ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{isEn ? 'ACTIVE' : 'ATIVO'}</span>
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 text-slate-400" />
              <span>{isEn ? 'INACTIVE' : 'INATIVO'}</span>
            </>
          )}
        </button>
      </td>

      {/* Last Login */}
      <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatLastLogin(member.lastLoginAt)}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onResetAndShare(member)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
            title={
              isEn
                ? 'Generate new temporary password and copy credentials for WhatsApp'
                : 'Gerar nova senha provisória e copiar dados para WhatsApp'
            }
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEn ? 'WhatsApp Access' : 'Acesso WhatsApp'}</span>
          </button>

          <button
            onClick={() => onOpenEdit(member)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEn ? 'Edit' : 'Editar'}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
