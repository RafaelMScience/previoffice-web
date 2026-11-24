'use client';

import React from 'react';
import {
  Building2,
  UserCheck,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Lock,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
  Eye,
  EyeOff,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { maskCpfCnpj, maskPhone } from '@/lib/utils/masks';
import { generateRandomPassword } from '@/lib/auth/password-generator';

interface AdminOfficeFormProps {
  // Office state
  officeName: string;
  setOfficeName: (val: string) => void;
  cnpj: string;
  setCnpj: (val: string) => void;
  societyOab: string;
  setSocietyOab: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  officeEmail: string;
  setOfficeEmail: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  planType: string;
  setPlanType: (val: string) => void;

  // Lawyer state
  lawyerName: string;
  setLawyerName: (val: string) => void;
  lawyerCpf: string;
  setLawyerCpf: (val: string) => void;
  lawyerOabNumber: string;
  setLawyerOabNumber: (val: string) => void;
  lawyerOabUf: string;
  setLawyerOabUf: (val: string) => void;
  lawyerPhone: string;
  setLawyerPhone: (val: string) => void;
  lawyerEmail: string;
  setLawyerEmail: (val: string) => void;
  lawyerPassword: string;
  setLawyerPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  copiedPassword: boolean;
  setCopiedPassword: (val: boolean) => void;
  onOpenShareModal: () => void;

  // Form submit state
  onSubmit: (e: React.FormEvent) => void;
  provisioning: boolean;
  provisionError: string | null;
}

export function AdminOfficeForm({
  officeName,
  setOfficeName,
  cnpj,
  setCnpj,
  societyOab,
  setSocietyOab,
  phone,
  setPhone,
  officeEmail,
  setOfficeEmail,
  address,
  setAddress,
  planType,
  setPlanType,
  lawyerName,
  setLawyerName,
  lawyerCpf,
  setLawyerCpf,
  lawyerOabNumber,
  setLawyerOabNumber,
  lawyerOabUf,
  setLawyerOabUf,
  lawyerPhone,
  setLawyerPhone,
  lawyerEmail,
  setLawyerEmail,
  lawyerPassword,
  setLawyerPassword,
  showPassword,
  setShowPassword,
  copiedPassword,
  setCopiedPassword,
  onOpenShareModal,
  onSubmit,
  provisioning,
  provisionError,
}: AdminOfficeFormProps) {
  const { t } = useI18n();

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-10 w-full animate-in fade-in duration-200">
      {/* Header & Unlock Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-700 gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">
            {t.adminProvisioning.pageTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.adminProvisioning.pageSubtitle}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 self-start sm:self-center">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Autorizado</span>
        </span>
      </div>

      {provisionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{provisionError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Section 1: Law Office Data (Pessoa Jurídica / Sociedade) */}
        <div>
          <div className="flex items-center gap-2 text-[#C89543] font-bold text-sm mb-3">
            <Building2 className="w-4 h-4" />
            <span>{t.adminProvisioning.formSecOffice}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.officeNameLabel}
              </label>
              <input
                type="text"
                required
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder={t.adminProvisioning.officeNamePlaceholder}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.cnpjCpfLabel}
              </label>
              <input
                type="text"
                required
                maxLength={18}
                value={cnpj}
                onChange={(e) => setCnpj(maskCpfCnpj(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.societyOabLabel}
              </label>
              <input
                type="text"
                value={societyOab}
                onChange={(e) => setSocietyOab(e.target.value)}
                placeholder={t.adminProvisioning.societyOabPlaceholder}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.phoneLabel}
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.planLabel}
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              >
                <option value="TRIAL_90_DAYS">{t.adminProvisioning.planTrial}</option>
                <option value="ANNUAL_ENTERPRISE">{t.adminProvisioning.planAnnual}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.officeEmailLabel}
              </label>
              <input
                type="email"
                required
                value={officeEmail}
                onChange={(e) => setOfficeEmail(e.target.value)}
                placeholder={t.adminProvisioning.officeEmailPlaceholder}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.officeAddressLabel}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Paulista, nº 1000, Sala 501 - Centro"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Managing Lawyer Account (Pessoa Física) */}
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-[#C89543] font-bold text-sm mb-3">
            <UserCheck className="w-4 h-4" />
            <span>{t.adminProvisioning.formSecLawyer}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.lawyerNameLabel}
              </label>
              <input
                type="text"
                required
                value={lawyerName}
                onChange={(e) => setLawyerName(e.target.value)}
                placeholder={t.adminProvisioning.lawyerNamePlaceholder}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.lawyerCpfLabel}
              </label>
              <input
                type="text"
                required
                maxLength={14}
                value={lawyerCpf}
                onChange={(e) => setLawyerCpf(maskCpfCnpj(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  {t.adminProvisioning.lawyerOabNumberLabel}
                </label>
                <input
                  type="text"
                  required
                  value={lawyerOabNumber}
                  onChange={(e) => setLawyerOabNumber(e.target.value)}
                  placeholder={t.adminProvisioning.lawyerOabNumberPlaceholder}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {t.adminProvisioning.lawyerOabUfLabel}
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={lawyerOabUf}
                  onChange={(e) => setLawyerOabUf(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.lawyerPhoneLabel}
              </label>
              <input
                type="text"
                maxLength={15}
                value={lawyerPhone}
                onChange={(e) => setLawyerPhone(maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                {t.adminProvisioning.lawyerEmailLabel}
              </label>
              <input
                type="email"
                required
                name="admin_provision_lawyer_email"
                autoComplete="off"
                value={lawyerEmail}
                onChange={(e) => setLawyerEmail(e.target.value)}
                placeholder={t.adminProvisioning.lawyerEmailPlaceholder}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
              />
            </div>

            <div className="md:col-span-3 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3 mt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#C89543]" />
                  <span>Senha Inicial de Acesso</span>
                </label>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-600/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>Troca obrigatória no 1º login</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    name="temp_lawyer_password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={lawyerPassword}
                    onChange={(e) => setLawyerPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-emerald-400 focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] focus:outline-none select-all tracking-wider"
                    placeholder="Prev#..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha visível'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400 hover:text-white" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLawyerPassword(generateRandomPassword());
                    setCopiedPassword(false);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Gerar nova senha provisória aleatória"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>Gerar Outra</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (lawyerPassword) {
                      navigator.clipboard.writeText(lawyerPassword)
                        .then(() => {
                          setCopiedPassword(true);
                          setTimeout(() => setCopiedPassword(false), 2000);
                        })
                        .catch(() => {});
                    }
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Copiar apenas a senha para a área de transferência"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiada</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Senha</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Compartilhar dados de acesso via WhatsApp ou mensagem formatada"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compartilhar</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Senha gerada automaticamente com alta segurança e visível por padrão (use o ícone de olho para ocultar/exibir). Clique em <strong>Compartilhar</strong> para enviar a mensagem pronta com link de login via WhatsApp com custo R$ 0,00.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={provisioning}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C89543] to-[#dfad5e] text-[#0B192E] font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>
              {provisioning
                ? t.adminProvisioning.btnCreating
                : t.adminProvisioning.btnCreateOffice}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
