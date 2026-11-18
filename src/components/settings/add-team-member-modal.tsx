'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  Scale,
  Users,
  GraduationCap,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { MemberType, TeamMember, TeamPermissions } from '@/types/settings';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: TeamMember | null;
  onSave: (memberData: Omit<TeamMember, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => void;
}

const DEFAULT_PERMISSIONS: Record<MemberType, TeamPermissions> = {
  LAWYER: {
    receptionDesk: true,
    clientsManage: true,
    casesManage: true,
    contractsAndFinancial: true,
    templatesManage: true,
    adminSettings: false,
  },
  ASSISTANT: {
    receptionDesk: true,
    clientsManage: true,
    casesManage: false,
    contractsAndFinancial: false,
    templatesManage: false,
    adminSettings: false,
  },
  INTERN: {
    receptionDesk: true,
    clientsManage: true,
    casesManage: true,
    contractsAndFinancial: false,
    templatesManage: false,
    adminSettings: false,
  },
};

export function AddTeamMemberModal({
  isOpen,
  onClose,
  memberToEdit,
  onSave,
}: AddTeamMemberModalProps) {
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberType, setMemberType] = useState<MemberType>('LAWYER');
  const [oabNumber, setOabNumber] = useState('');
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<TeamPermissions>(DEFAULT_PERMISSIONS.LAWYER);

  useEffect(() => {
    if (memberToEdit) {
      setFullName(memberToEdit.fullName);
      setEmail(memberToEdit.email);
      setPhone(memberToEdit.phone || '');
      setMemberType(memberToEdit.memberType);
      setOabNumber(memberToEdit.oabNumber || '');
      setActive(memberToEdit.active);
      setPermissions(memberToEdit.permissions);
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setMemberType('LAWYER');
      setOabNumber('');
      setActive(true);
      setPermissions(DEFAULT_PERMISSIONS.LAWYER);
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleMemberTypeChange = (newType: MemberType) => {
    setMemberType(newType);
    if (!memberToEdit) {
      setPermissions(DEFAULT_PERMISSIONS[newType]);
    }
  };

  const handleTogglePermission = (key: keyof TeamPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    onSave({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      memberType,
      oabNumber: memberType === 'LAWYER' ? oabNumber.trim() : undefined,
      active,
      permissions,
    });

    onClose();
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
          {/* Member Classification Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {t.settings.lblMemberType} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleMemberTypeChange('LAWYER')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  memberType === 'LAWYER'
                    ? 'border-[#082A52] bg-[#082A52]/5 text-[#082A52] ring-1 ring-[#082A52]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Scale className={`w-4 h-4 ${memberType === 'LAWYER' ? 'text-[#C89543]' : 'text-slate-400'}`} />
                  {memberType === 'LAWYER' && <CheckCircle2 className="w-4 h-4 text-[#082A52]" />}
                </div>
                <span className="text-xs font-bold">{t.settings.lawyer}</span>
                <span className="text-[10px] text-slate-500">Possui OAB e assina peças</span>
              </button>

              <button
                type="button"
                onClick={() => handleMemberTypeChange('ASSISTANT')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  memberType === 'ASSISTANT'
                    ? 'border-[#082A52] bg-[#082A52]/5 text-[#082A52] ring-1 ring-[#082A52]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <User className={`w-4 h-4 ${memberType === 'ASSISTANT' ? 'text-[#C89543]' : 'text-slate-400'}`} />
                  {memberType === 'ASSISTANT' && <CheckCircle2 className="w-4 h-4 text-[#082A52]" />}
                </div>
                <span className="text-xs font-bold">{t.settings.assistant}</span>
                <span className="text-[10px] text-slate-500">Recepção e triagem inicial</span>
              </button>

              <button
                type="button"
                onClick={() => handleMemberTypeChange('INTERN')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  memberType === 'INTERN'
                    ? 'border-[#082A52] bg-[#082A52]/5 text-[#082A52] ring-1 ring-[#082A52]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <GraduationCap className={`w-4 h-4 ${memberType === 'INTERN' ? 'text-[#C89543]' : 'text-slate-400'}`} />
                  {memberType === 'INTERN' && <CheckCircle2 className="w-4 h-4 text-[#082A52]" />}
                </div>
                <span className="text-xs font-bold">{t.settings.intern}</span>
                <span className="text-[10px] text-slate-500">Apoio a processos e minutas</span>
              </button>
            </div>
          </div>

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
                  placeholder="Nome completo do colaborador"
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
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(83) 98888-0000"
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
                    placeholder="OAB/PB 22.100"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Access Provisioning Notice */}
          {!memberToEdit && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Primeiro Acesso & Credenciais: </span>
                Ao salvar, o sistema gera o convite corporativo seguro para o e-mail informado ({email || 'colaborador@...'}), permitindo que o usuário crie sua senha pessoal com chave criptografada.
              </div>
            </div>
          )}

          {/* Granular Permissions Matrix (Checkboxes) */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              {t.settings.permSectionTitle}
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Marque os módulos e funções que este colaborador está autorizado a acessar:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Reception */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions.receptionDesk}
                  onChange={() => handleTogglePermission('receptionDesk')}
                  className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.settings.permReception}</div>
                  <div className="text-[10px] text-slate-500">{t.settings.permReceptionDesc}</div>
                </div>
              </label>

              {/* Clients */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions.clientsManage}
                  onChange={() => handleTogglePermission('clientsManage')}
                  className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.settings.permClients}</div>
                  <div className="text-[10px] text-slate-500">{t.settings.permClientsDesc}</div>
                </div>
              </label>

              {/* Cases */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions.casesManage}
                  onChange={() => handleTogglePermission('casesManage')}
                  className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.settings.permCases}</div>
                  <div className="text-[10px] text-slate-500">{t.settings.permCasesDesc}</div>
                </div>
              </label>

              {/* Contracts & Financial */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions.contractsAndFinancial}
                  onChange={() => handleTogglePermission('contractsAndFinancial')}
                  className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.settings.permContracts}</div>
                  <div className="text-[10px] text-slate-500">{t.settings.permContractsDesc}</div>
                </div>
              </label>

              {/* Templates */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions.templatesManage}
                  onChange={() => handleTogglePermission('templatesManage')}
                  className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.settings.permTemplates}</div>
                  <div className="text-[10px] text-slate-500">{t.settings.permTemplatesDesc}</div>
                </div>
              </label>

              {/* Admin */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={permissions.adminSettings}
                  onChange={() => handleTogglePermission('adminSettings')}
                  className="mt-0.5 rounded text-[#082A52] focus:ring-[#C89543] w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{t.settings.permAdmin}</div>
                  <div className="text-[10px] text-slate-500">{t.settings.permAdminDesc}</div>
                </div>
              </label>
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">Status do Colaborador</div>
              <div className="text-[11px] text-slate-500">Membros inativos não conseguem realizar login no sistema</div>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                active
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              {active ? 'ATIVO' : 'INATIVO'}
            </button>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-xs"
            >
              {t.settings.btnSaveMember}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
