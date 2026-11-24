'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Lock,
  Users,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { MemberType, TeamMember, TeamPermissions } from '@/types/settings';
import { generateRandomPassword } from '@/lib/auth/password-generator';
import { maskPhone } from '@/lib/utils/masks';
import { TeamRoleSelector, TeamPermissionsMatrix } from './team/index';

export { generateRandomPassword };

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: TeamMember | null;
  existingEmails?: string[];
  onSave: (memberData: Omit<TeamMember, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Promise<void> | void;
}

const DEFAULT_PERMISSIONS: Record<MemberType, TeamPermissions> = {
  LAWYER: {
    receptionDesk: true,
    clientsManage: true,
    casesManage: true,
    contractsAndFinancial: true,
    templatesManage: true,
    adminSettings: false,
    securityAudit: false,
  },
  ASSISTANT: {
    receptionDesk: true,
    clientsManage: true,
    casesManage: false,
    contractsAndFinancial: false,
    templatesManage: false,
    adminSettings: false,
    securityAudit: false,
  },
  INTERN: {
    receptionDesk: true,
    clientsManage: true,
    casesManage: true,
    contractsAndFinancial: false,
    templatesManage: false,
    adminSettings: false,
    securityAudit: false,
  },
};

export function AddTeamMemberModal({
  isOpen,
  onClose,
  memberToEdit,
  existingEmails,
  onSave,
}: AddTeamMemberModalProps) {
  const { t, locale } = useI18n();
  const isEn = locale === 'en-US';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberType, setMemberType] = useState<MemberType>('LAWYER');
  const [oabNumber, setOabNumber] = useState('');
  const [isAdminLawyer, setIsAdminLawyer] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<TeamPermissions>(DEFAULT_PERMISSIONS.LAWYER);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setErrorMsg(null);
    setIsSaving(false);
    if (memberToEdit) {
      setFullName(memberToEdit.fullName);
      setEmail(memberToEdit.email);
      setPhone(memberToEdit.phone ? maskPhone(memberToEdit.phone) : '');
      setMemberType(memberToEdit.memberType);
      setOabNumber(memberToEdit.oabNumber || '');
      setIsAdminLawyer(memberToEdit.isAdminLawyer || false);
      setActive(memberToEdit.active);
      setPermissions(memberToEdit.permissions);
      setTempPassword(memberToEdit.temporaryPassword || '');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setMemberType('LAWYER');
      setOabNumber('');
      setIsAdminLawyer(false);
      setActive(true);
      setPermissions(DEFAULT_PERMISSIONS.LAWYER);
      setTempPassword(generateRandomPassword());
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const ALL_PERMISSIONS_CHECKED: TeamPermissions = {
    receptionDesk: true,
    clientsManage: true,
    casesManage: true,
    contractsAndFinancial: true,
    templatesManage: true,
    adminSettings: true,
    securityAudit: true,
  };

  const handleAdminToggle = (checked: boolean) => {
    setIsAdminLawyer(checked);
    if (checked) {
      setPermissions(ALL_PERMISSIONS_CHECKED);
    } else {
      setPermissions(DEFAULT_PERMISSIONS[memberType]);
    }
  };

  const handleMemberTypeChange = (newType: MemberType) => {
    setMemberType(newType);
    if (isAdminLawyer) {
      setPermissions(ALL_PERMISSIONS_CHECKED);
    } else if (!memberToEdit) {
      setPermissions(DEFAULT_PERMISSIONS[newType]);
    }
  };

  const handleTogglePermission = (key: keyof TeamPermissions) => {
    if (isAdminLawyer) return;
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName.trim() || !email.trim()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (existingEmails && existingEmails.includes(cleanEmail)) {
      setErrorMsg(
        isEn
          ? `The email "${cleanEmail}" is already registered for another member.`
          : `O e-mail "${cleanEmail}" já está cadastrado para outro membro.`
      );
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim() || undefined,
        memberType,
        oabNumber: memberType === 'LAWYER' ? oabNumber.trim() : undefined,
        isAdminLawyer,
        active,
        permissions: isAdminLawyer ? ALL_PERMISSIONS_CHECKED : permissions,
        temporaryPassword: !memberToEdit ? tempPassword : memberToEdit.temporaryPassword,
        mustChangePassword: !memberToEdit ? true : memberToEdit.mustChangePassword,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (isEn ? 'Error saving team member.' : 'Erro ao salvar colaborador.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#082A52] text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#C89543]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#082A52]">
                {memberToEdit
                  ? t.settings.modalEditMemberTitle
                  : t.settings.modalNewMemberTitle}
              </h3>
              <p className="text-xs text-slate-500">{t.settings.modalMemberSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Member Classification Selection */}
          <TeamRoleSelector
            memberType={memberType}
            onChange={handleMemberTypeChange}
            locale={locale}
          />

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblFullName} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isEn ? 'Full name of the team member' : 'Nome completo do colaborador'}
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblEmail} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@previoffice.adv.br"
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblPhone}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(83) 98888-0000"
                  maxLength={15}
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            {memberType === 'LAWYER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOabNumber} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={oabNumber}
                    onChange={(e) => setOabNumber(e.target.value)}
                    placeholder="OAB/AM 22.100"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="md:col-span-2 p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 flex items-start gap-3">
              <input
                type="checkbox"
                id="isAdminLawyer"
                checked={isAdminLawyer}
                onChange={(e) => handleAdminToggle(e.target.checked)}
                className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isAdminLawyer" className="cursor-pointer select-none">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C89543]" />
                  <span>{t.settings.lblAdminLawyer}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {t.settings.lblAdminLawyerDesc}
                </div>
              </label>
            </div>
          </div>

          {/* Senha Provisória & Primeiro Acesso */}
          {!memberToEdit && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#C89543]" />
                  <span>{isEn ? 'Temporary Access Password' : 'Senha Provisória de Acesso'}</span>
                </label>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  <span>{isEn ? 'Mandatory change on 1st login' : 'Troca obrigatória no 1º login'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setTempPassword(generateRandomPassword())}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:border-[#C89543] text-slate-700 hover:text-[#082A52] flex items-center gap-1.5 transition-all shadow-2xs"
                  title={isEn ? 'Generate another secure random password' : 'Gerar outra senha aleatória segura'}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>{isEn ? 'Generate Another' : 'Gerar Outra'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                {isEn
                  ? 'Random password generated securely. You will be able to copy the formatted credentials message to send via WhatsApp with R$ 0.00 cost.'
                  : 'Senha aleatória gerada com segurança. Ao salvar, você poderá copiar a mensagem formatada para enviar via WhatsApp com custo R$ 0,00.'}
              </p>
            </div>
          )}

          {/* Granular Permissions Matrix */}
          <TeamPermissionsMatrix
            permissions={permissions}
            isAdminLawyer={isAdminLawyer}
            onTogglePermission={handleTogglePermission}
            locale={locale}
          />

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] hover:bg-[#0B3A70] text-white active:scale-98 transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C89543]" />}
              <span>{memberToEdit ? t.settings.btnSaveMember : (isEn ? 'Add Member' : 'Cadastrar Membro')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
