'use client';

import React from 'react';
import {
  Users,
  Scale,
  GraduationCap,
  User,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import type { TeamMember } from '@/types/settings';

interface OperatorSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorSwitcherModal({
  isOpen,
  onClose,
}: OperatorSwitcherModalProps) {
  const { currentUser, switchUser, availableUsers } = useAuth();

  if (!isOpen) return null;

  const handleSelect = (member: TeamMember) => {
    switchUser(member.id);
    onClose();
  };

  const getRoleIcon = (member: TeamMember) => {
    if (member.memberType === 'LAWYER') {
      return <Scale className="w-4 h-4 text-[#C89543]" />;
    }
    if (member.memberType === 'ASSISTANT') {
      return <User className="w-4 h-4 text-amber-600" />;
    }
    return <GraduationCap className="w-4 h-4 text-blue-600" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#082A52]/10 text-[#082A52] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#C89543]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alternar Operador do Sistema</h3>
              <p className="text-[11px] text-slate-500">
                Selecione um colaborador para simular as permissões ativas (RBAC):
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {availableUsers.map((member) => {
            const isCurrent = member.id === currentUser?.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-[#082A52] bg-[#082A52]/5 ring-1 ring-[#082A52]'
                    : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#082A52] to-[#0B192E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(member.fullName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{member.fullName}</span>
                      {member.isAdminLawyer && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                          Sócio Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      {getRoleIcon(member)}
                      <span>
                        {member.memberType === 'LAWYER'
                          ? `Advogado • ${member.oabNumber || ''}`
                          : member.memberType === 'ASSISTANT'
                          ? 'Assistente de Atendimento'
                          : 'Estagiário de Direito'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.mustChangePassword && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span>1º Acesso</span>
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Ativo</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Ao trocar de operador, os menus restritos <strong>somem automaticamente</strong> da barra lateral e da tela.
          </span>
        </div>
      </div>
    </div>
  );
}
