'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Scale,
  User,
  GraduationCap,
  Shield,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MessageCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { settingsStore } from '@/lib/data/mock-settings';
import type { MemberType, TeamMember } from '@/types/settings';
import { AddTeamMemberModal, generateRandomPassword } from './add-team-member-modal';
import { ShareCredentialsModal } from './share-credentials-modal';

export function TeamManagementTab() {
  const { t, locale } = useI18n();
  const [members, setMembers] = useState<TeamMember[]>(() => settingsStore.getTeamMembers());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [shareData, setShareData] = useState<{ member: TeamMember; tempPassword: string } | null>(null);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.oabNumber && member.oabNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'LAWYER') return member.memberType === 'LAWYER';
    if (filterType === 'ASSISTANT') return member.memberType === 'ASSISTANT';
    if (filterType === 'INTERN') return member.memberType === 'INTERN';
    if (filterType === 'ACTIVE') return member.active;
    if (filterType === 'INACTIVE') return !member.active;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleResetAndShare = (member: TeamMember) => {
    const newTemp = generateRandomPassword();

    const updated = settingsStore.resetMemberPassword(member.id, newTemp);
    if (updated) {
      setMembers(settingsStore.getTeamMembers());
      setShareData({
        member: updated,
        tempPassword: newTemp,
      });
    }
  };

  const handleToggleActive = (id: string) => {
    if (id === 'usr-001') {
      setWarningMessage(
        locale === 'pt-BR'
          ? 'Não é permitido desativar o advogado administrador titular da banca.'
          : 'Cannot deactivate the primary law firm administrator.'
      );
      setTimeout(() => setWarningMessage(null), 4000);
      return;
    }
    const updated = settingsStore.toggleMemberActive(id);
    if (updated) {
      setMembers(settingsStore.getTeamMembers());
    }
  };

  const handleSaveMember = (
    memberData: Omit<TeamMember, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ) => {
    let saved: TeamMember | null = null;
    if (editingMember) {
      const isPrimaryAdmin = editingMember.id === 'usr-001';
      saved = settingsStore.updateTeamMember({
        ...editingMember,
        ...memberData,
        active: isPrimaryAdmin ? true : memberData.active,
        permissions: isPrimaryAdmin
          ? { ...memberData.permissions, adminSettings: true }
          : memberData.permissions,
      });
    } else {
      saved = settingsStore.addTeamMember(memberData);
      if (memberData.temporaryPassword) {
        setShareData({
          member: saved,
          tempPassword: memberData.temporaryPassword,
        });
      }
    }
    setMembers(settingsStore.getTeamMembers());
  };

  const formatLastLogin = (isoString?: string) => {
    if (!isoString) return locale === 'pt-BR' ? 'Nunca logou' : 'Never logged in';
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Warning banner */}
      {warningMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#082A52] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C89543]" />
            {t.settings.teamTitle}
          </h2>
          <p className="text-xs text-slate-500">{t.settings.teamSubtitle}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#C89543] stroke-[2.5]" />
          {t.settings.btnNewMember}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-[#082A52] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({members.length})
          </button>
          <button
            onClick={() => setFilterType('LAWYER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'LAWYER'
                ? 'bg-[#082A52] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Advogados ({members.filter((m) => m.memberType === 'LAWYER').length})
          </button>
          <button
            onClick={() => setFilterType('ASSISTANT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ASSISTANT'
                ? 'bg-[#082A52] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Assistentes ({members.filter((m) => m.memberType === 'ASSISTANT').length})
          </button>
          <button
            onClick={() => setFilterType('INTERN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'INTERN'
                ? 'bg-[#082A52] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Estagiários ({members.filter((m) => m.memberType === 'INTERN').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar colaborador..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#C89543] outline-hidden text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Team Members Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">{t.settings.colMember}</th>
                <th className="py-3.5 px-4">{t.settings.colType}</th>
                <th className="py-3.5 px-4">{t.settings.colPermissions}</th>
                <th className="py-3.5 px-4">{t.settings.colStatus}</th>
                <th className="py-3.5 px-4">{t.settings.colLastLogin}</th>
                <th className="py-3.5 px-4 text-right">{t.settings.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
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
                    {member.memberType === 'LAWYER' ? (
                      <div className="flex flex-col gap-1 items-start">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20">
                          <Scale className="w-3.5 h-3.5 text-[#C89543]" />
                          <span>{t.settings.lawyer}</span>
                          {member.oabNumber && (
                            <span className="text-[10px] font-mono text-slate-600">({member.oabNumber})</span>
                          )}
                        </div>
                        {member.isAdminLawyer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Shield className="w-3 h-3 text-amber-700" />
                            <span>Sócio Admin</span>
                          </span>
                        )}
                      </div>
                    ) : member.memberType === 'ASSISTANT' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t.settings.assistant}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t.settings.intern}</span>
                      </div>
                    )}
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
                          Auditoria (LGPD)
                        </span>
                      )}
                      {member.permissions.receptionDesk && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Recepção
                        </span>
                      )}
                      {member.permissions.clientsManage && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Clientes
                        </span>
                      )}
                      {member.permissions.casesManage && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Processos
                        </span>
                      )}
                      {member.permissions.contractsAndFinancial && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Honorários
                        </span>
                      )}
                      {member.permissions.templatesManage && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Minutas
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(member.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                        member.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Clique para alternar o status"
                    >
                      {member.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ATIVO</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>INATIVO</span>
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
                        onClick={() => handleResetAndShare(member)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                        title="Gerar nova senha provisória e copiar dados para WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acesso WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <AddTeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberToEdit={editingMember}
        onSave={handleSaveMember}
      />

      {/* Share WhatsApp Credentials Modal */}
      <ShareCredentialsModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        member={shareData?.member || null}
        temporaryPassword={shareData?.tempPassword || ''}
      />
    </div>
  );
}
