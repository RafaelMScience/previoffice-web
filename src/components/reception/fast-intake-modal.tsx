'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PlusCircle,
  User,
  Phone,
  CreditCard,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { isValidCpf } from '@/lib/domain/cpf-validator';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import { settingsStore } from '@/lib/data/mock-settings';

export interface FastIntakeData {
  fullName: string;
  phone: string;
  cpf: string;
  benefit: string;
  notes: string;
  registeredBy?: string;
  assignedLawyerName?: string;
}

interface FastIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: FastIntakeData) => void;
}

export function FastIntakeModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: FastIntakeModalProps) {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const teamMembers = settingsStore.getTeamMembers();
  const activeLawyers = settingsStore.getActiveLawyers();
  const lawyerOptions = React.useMemo(() => {
    const list = [...activeLawyers];
    if (list.length === 0) {
      if (currentUser?.fullName) {
        list.push({
          id: currentUser.id,
          tenantId: currentUser.tenantId,
          fullName: currentUser.fullName,
          email: currentUser.email,
          phone: '',
          memberType: 'LAWYER',
          oabNumber: currentUser.oabNumber || 'OAB',
          isAdminLawyer: currentUser.isAdminLawyer,
          active: true,
          permissions: currentUser.permissions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        list.push({
          id: 'adv-titular',
          tenantId: 'tenant-default',
          fullName: 'Advogado Titular',
          email: 'advogado@previoffice.com',
          phone: '',
          memberType: 'LAWYER',
          oabNumber: 'OAB',
          isAdminLawyer: true,
          active: true,
          permissions: {
            receptionDesk: true,
            clientsManage: true,
            casesManage: true,
            contractsAndFinancial: true,
            templatesManage: true,
            adminSettings: true,
            securityAudit: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return list;
  }, [activeLawyers, currentUser]);

  const [createdById, setCreatedById] = useState<string>(() => currentUser?.id || 'usr-default');
  const [assignedLawyerId, setAssignedLawyerId] = useState<string>(() => lawyerOptions[0]?.id || '');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [benefit, setBenefit] = useState('Rural Special Retirement');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-focus on name field when opened & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      // Reset form state on close
      setFullName('');
      setPhone('');
      setCpf('');
      setBenefit('Rural Special Retirement');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanCpf = cpf.replace(/\D/g, '');
  const cpfValid = cleanCpf.length === 11 ? isValidCpf(cleanCpf) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('O nome completo deve ter pelo menos 3 letras.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('O número de celular ou WhatsApp é obrigatório.');
      return;
    }

    if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
      setErrorMsg('O CPF deve ter 11 dígitos numéricos ou ser deixado em branco.');
      return;
    }

    if (cleanCpf.length === 11 && !isValidCpf(cleanCpf)) {
      setErrorMsg(t.fastIntake.cpfInvalid);
      return;
    }

    setSubmitting(true);

    try {
      // Simulate quick async registration
      await new Promise((resolve) => setTimeout(resolve, 350));

      const creator = teamMembers.find((m) => m.id === createdById);
      const lawyer = activeLawyers.find((m) => m.id === assignedLawyerId);

      onSubmitSuccess({
        fullName: fullName.trim(),
        phone: phone.trim(),
        cpf: cleanCpf || '',
        benefit,
        notes: notes.trim() || 'Entrada rápida de balcão registrada.',
        registeredBy: creator?.fullName || 'Recepção',
        assignedLawyerName: lawyer?.fullName || 'Dr. Alexandre Pontes',
      });

      onClose();
    } catch {
      setErrorMsg('Falha ao registrar entrada rápida. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0B192E] text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Clock className="w-4 h-4" />
            <span>{t.fastIntake.speedBadge}</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.fastIntake.modalTitle}</span>
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            {t.fastIntake.modalSubtitle}
          </p>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.fullNameLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={nameInputRef}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fastIntake.fullNamePlaceholder}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-medium"
              />
            </div>
          </div>

          {/* 2. Celular / WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.phoneLabel}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                maxLength={15}
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder={t.fastIntake.phonePlaceholder}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-mono"
              />
            </div>
          </div>

          {/* 3. CPF (Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t.fastIntake.cpfLabel}
              </label>
              <span className="text-[10px] text-slate-400">
                {t.fastIntake.cpfOptionalNote}
              </span>
            </div>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                placeholder={t.fastIntake.cpfPlaceholder}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 transition-all font-mono ${
                  !cpfValid
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-[#C89543] focus:bg-white'
                }`}
              />
            </div>
            {!cpfValid && (
              <span className="text-[11px] text-red-600 font-medium block mt-1">
                {t.fastIntake.cpfInvalid}
              </span>
            )}
          </div>

          {/* 4. Benefício Almejado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.benefitLabel}
            </label>
            <div className="relative">
              <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={benefit}
                onChange={(e) => setBenefit(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-medium"
              >
                <option value="Rural Special Retirement">Aposentadoria Rural - Segurado Especial</option>
                <option value="BPC/LOAS Elderly">BPC / LOAS - Idoso (≥ 65 anos)</option>
                <option value="BPC/LOAS Disability">BPC / LOAS - Pessoa com Deficiência (PCD)</option>
                <option value="Age Retirement Urban">Aposentadoria Urbana por Idade</option>
                <option value="Temporary Disability">Benefício por Incapacidade (Auxílio-Doença)</option>
                <option value="Death Pension">Pensão por Morte</option>
                <option value="Maternity Benefit">Salário-Maternidade Rural/Urbano</option>
                <option value="General Query">Consulta Geral / Outros</option>
              </select>
            </div>
          </div>

          {/* Rastreabilidade de Atendimento: Cadastrado por & Advogado Responsável */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Cadastrado por
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
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberType === 'LAWYER' ? 'Advogado' : m.memberType === 'ASSISTANT' ? 'Assistente' : 'Estagiário'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Advogado que irá atender <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignedLawyerId}
                  onChange={(e) => setAssignedLawyerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#082A52] rounded-lg font-bold text-[#082A52] focus:ring-1 focus:ring-[#C89543]"
                >
                  {lawyerOptions.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.fullName} ({lawyer.oabNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {teamMembers.find((m) => m.id === createdById)?.memberType === 'LAWYER'
                ? 'Advogado logado: pode atender pessoalmente ou atribuir a outro colega.'
                : 'Assistente / Recepção: obrigatório vincular o advogado responsável pelo caso.'}
            </p>
          </div>

          {/* 5. Anotação Rápida */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.fastIntake.notesPlaceholder}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[#0B192E] hover:bg-[#142642] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4 text-[#C89543]" />
              <span>{submitting ? t.fastIntake.btnSubmitting : t.fastIntake.btnSubmit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
