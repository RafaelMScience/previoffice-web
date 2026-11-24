'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { settingsStore } from '@/lib/data/mock-settings';
import type { TeamMember } from '@/types/settings';
import { AddTeamMemberModal } from './add-team-member-modal';
import { ShareCredentialsModal } from './share-credentials-modal';
import { TeamFiltersBar, TeamMemberRow } from './team/index';

export function TeamManagementTab() {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const isEn = locale === 'en-US';

  const [members, setMembers] = useState<TeamMember[]>(() =>
    currentUser ? [currentUser] : settingsStore.getTeamMembers()
  );

  useEffect(() => {
    if (!currentUser?.tenantId) return;
    const supabase = createClient();
    (supabase.from('profiles') as any)
      .select('*')
      .eq('tenant_id', currentUser.tenantId)
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          const loaded: TeamMember[] = data.map((p: any) => ({
            id: p.id,
            tenantId: p.tenant_id,
            fullName: p.full_name,
            email: p.email,
            phone: p.phone || undefined,
            oabNumber: p.oab_number || undefined,
            memberType:
              p.role === 'INTERN'
                ? 'INTERN'
                : p.role === 'ASSISTANT' || p.role === 'RECEPTIONIST' || (p.role === 'MANAGING_LAWYER' && !p.oab_number)
                ? 'ASSISTANT'
                : 'LAWYER',
            isAdminLawyer: p.role === 'MANAGING_LAWYER',
            active: p.is_active ?? true,
            lastLoginAt: p.last_login_at || undefined,
            permissions:
              p.role === 'MANAGING_LAWYER'
                ? {
                    receptionDesk: true,
                    clientsManage: true,
                    casesManage: true,
                    contractsAndFinancial: true,
                    templatesManage: true,
                    adminSettings: true,
                    securityAudit: true,
                  }
                : p.id === currentUser?.id && currentUser?.permissions
                ? currentUser.permissions
                : {
                    receptionDesk: true,
                    clientsManage: true,
                    casesManage: p.role !== 'ASSISTANT',
                    contractsAndFinancial: p.role === 'ASSOCIATE_LAWYER',
                    templatesManage: p.role !== 'ASSISTANT',
                    adminSettings: false,
                    securityAudit: false,
                  },
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setMembers(loaded);
        } else if (currentUser) {
          setMembers([currentUser]);
        }
      });
  }, [currentUser]);

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

  const handleResetAndShare = async (member: TeamMember) => {
    try {
      const res = await fetch('/api/team/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWarningMessage(data.error || (isEn ? 'Failed to generate temporary password.' : 'Erro ao gerar nova senha provisória.'));
        setTimeout(() => setWarningMessage(null), 4000);
        return;
      }

      const updated = { ...member, temporaryPassword: data.temporaryPassword, mustChangePassword: true };
      settingsStore.updateTeamMember(updated);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
      setShareData({
        member: updated,
        tempPassword: data.temporaryPassword,
      });
    } catch (err: any) {
      setWarningMessage(err?.message || (isEn ? 'Connection error while resetting credentials.' : 'Erro ao conectar ao servidor para redefinir credencial.'));
      setTimeout(() => setWarningMessage(null), 4000);
    }
  };

  const handleToggleActive = async (id: string) => {
    const target = members.find((m) => m.id === id);
    if (!target) return;

    if (target.isAdminLawyer && target.active) {
      const activeAdmins = members.filter((m) => m.isAdminLawyer && m.active);
      if (activeAdmins.length <= 1) {
        setWarningMessage(
          isEn
            ? 'Cannot deactivate the only active administrator of the firm.'
            : 'Não é permitido desativar o único advogado administrador ativo da banca.'
        );
        setTimeout(() => setWarningMessage(null), 4000);
        return;
      }
    }

    const newActive = !target.active;
    try {
      const res = await fetch('/api/team/update-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          fullName: target.fullName,
          phone: target.phone,
          oabNumber: target.oabNumber,
          memberType: target.memberType,
          isAdminLawyer: target.isAdminLawyer,
          active: newActive,
          permissions: target.permissions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setWarningMessage(data.error || (isEn ? 'Failed to update member status.' : 'Erro ao alterar status do colaborador.'));
        setTimeout(() => setWarningMessage(null), 4000);
        return;
      }

      settingsStore.toggleMemberActive(id);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, active: newActive } : m)));
    } catch (err: any) {
      setWarningMessage(err?.message || (isEn ? 'Connection error while updating status.' : 'Erro de conexão ao alterar status.'));
      setTimeout(() => setWarningMessage(null), 4000);
    }
  };

  const handleSaveMember = async (
    memberData: Omit<TeamMember, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ) => {
    const emailLower = memberData.email.trim().toLowerCase();

    // Check duplicate email across team members
    if (editingMember) {
      const isDuplicate = members.some(
        (m) => m.id !== editingMember.id && m.email.trim().toLowerCase() === emailLower
      );
      if (isDuplicate) {
        throw new Error(
          isEn
            ? `Another team member is already registered with email "${emailLower}".`
            : `Já existe outro membro da equipe cadastrado com o e-mail "${emailLower}".`
        );
      }
    } else {
      const isDuplicate = members.some(
        (m) => m.email.trim().toLowerCase() === emailLower
      );
      if (isDuplicate) {
        throw new Error(
          isEn
            ? `A team member is already registered with email "${emailLower}".`
            : `Já existe um membro da equipe cadastrado com o e-mail "${emailLower}".`
        );
      }
    }

    if (editingMember) {
      const isPrimaryAdmin = editingMember.id === 'usr-001';
      const isNowAdmin = isPrimaryAdmin || memberData.isAdminLawyer;

      const updatedMember: TeamMember = {
        ...editingMember,
        ...memberData,
        email: emailLower,
        isAdminLawyer: isNowAdmin,
        active: isPrimaryAdmin ? true : memberData.active,
        permissions: isNowAdmin
          ? {
              receptionDesk: true,
              clientsManage: true,
              casesManage: true,
              contractsAndFinancial: true,
              templatesManage: true,
              adminSettings: true,
              securityAudit: true,
            }
          : memberData.permissions,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/team/update-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMember.id,
          fullName: updatedMember.fullName,
          phone: updatedMember.phone,
          oabNumber: updatedMember.oabNumber,
          memberType: updatedMember.memberType,
          isAdminLawyer: updatedMember.isAdminLawyer,
          active: updatedMember.active,
          permissions: updatedMember.permissions,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || (isEn ? 'Failed to update member on server.' : 'Falha ao atualizar colaborador no servidor.'));
      }

      settingsStore.updateTeamMember(updatedMember);
      setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    } else {
      const res = await fetch('/api/team/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: memberData.fullName,
          email: emailLower,
          phone: memberData.phone,
          memberType: memberData.memberType,
          oabNumber: memberData.oabNumber,
          isAdminLawyer: memberData.isAdminLawyer,
          active: memberData.active,
          permissions: memberData.permissions,
          temporaryPassword: memberData.temporaryPassword,
          tenantId: currentUser?.tenantId || '00000000-0000-0000-0000-000000000001',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || (isEn ? 'Failed to create team member.' : 'Falha ao cadastrar membro da equipe.'));
      }

      const createdMember: TeamMember = json.data;
      settingsStore.addTeamMember(createdMember);
      setMembers((prev) => [...prev, createdMember]);

      if (memberData.temporaryPassword) {
        setShareData({
          member: createdMember,
          tempPassword: memberData.temporaryPassword,
        });
      }
    }
  };

  const formatLastLogin = (isoString?: string) => {
    if (!isoString) return isEn ? 'Never logged in' : 'Nunca acessou';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isEn ? 'Never logged in' : 'Nunca acessou';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString(isEn ? 'en-US' : 'pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return isEn ? `Today at ${timeStr}` : `Hoje às ${timeStr}`;
    if (isYesterday) return isEn ? `Yesterday at ${timeStr}` : `Ontem às ${timeStr}`;

    const dateStr = date.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return isEn ? `${dateStr} at ${timeStr}` : `${dateStr} às ${timeStr}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Warning banner */}
      {warningMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
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
      <TeamFiltersBar
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        members={members}
        locale={locale}
      />

      {/* Team Members Table */}
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
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  onToggleActive={handleToggleActive}
                  onResetAndShare={handleResetAndShare}
                  onOpenEdit={handleOpenEdit}
                  formatLastLogin={formatLastLogin}
                  locale={locale}
                />
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
        existingEmails={members
          .filter((m) => m.id !== editingMember?.id)
          .map((m) => m.email.trim().toLowerCase())}
        onSave={handleSaveMember}
      />

      {/* Share WhatsApp Credentials Modal */}
      <ShareCredentialsModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        member={shareData?.member || null}
        temporaryPassword={shareData?.tempPassword || ''}
        officeName={settingsStore.getOfficeSettings()?.officeName || 'Escritório de Advocacia'}
      />
    </div>
  );
}
