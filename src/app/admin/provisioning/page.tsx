'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  KeyRound,
  Building2,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Copy,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { maskCpfCnpj, maskPhone } from '@/lib/utils/masks';

export default function AdminProvisioningPage() {
  const { t } = useI18n();

  // Gate state
  const [masterKey, setMasterKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verifyingGate, setVerifyingGate] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // Office form state
  const [officeName, setOfficeName] = useState('');
  const [oabNumber, setOabNumber] = useState('');
  const [oabUf, setOabUf] = useState('PB');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [address, setAddress] = useState('');

  // Lawyer user state
  const [lawyerName, setLawyerName] = useState('');
  const [lawyerEmail, setLawyerEmail] = useState('');
  const [lawyerPassword, setLawyerPassword] = useState('');
  const [planType, setPlanType] = useState('TRIAL_90_DAYS');

  // Submit & feedback
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionSuccess, setProvisionSuccess] = useState<any | null>(null);

  // Phase 1: Verify Master Secret
  const handleVerifyGate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    setVerifyingGate(true);

    try {
      const res = await fetch('/api/admin/verify-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGateError(
          data.error ||
            `${t.adminProvisioning.gateError} (${data.remaining || 0} ${t.adminProvisioning.gateAttemptsRemaining})`
        );
        setVerifyingGate(false);
        return;
      }

      setIsUnlocked(true);
      setVerifyingGate(false);
    } catch {
      setGateError('Network or server error validating master key.');
      setVerifyingGate(false);
    }
  };

  // Phase 2: Provision Office
  const handleProvisionOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError(null);
    setProvisioning(true);

    try {
      const res = await fetch('/api/admin/provision-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterKey,
          officeName,
          oabNumber,
          oabUf,
          taxId,
          phone,
          officeEmail,
          address,
          lawyerName,
          lawyerEmail,
          lawyerPassword,
          planType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProvisionError(data.error || 'Failed to provision office.');
        setProvisioning(false);
        return;
      }

      setProvisionSuccess(data.data);
      setProvisioning(false);
    } catch {
      setProvisionError('Failed to communicate with provisioning endpoint.');
      setProvisioning(false);
    }
  };

  const copyCredentials = () => {
    if (!provisionSuccess) return;
    const text = `PREVIOFFICE - CREDENCIAIS DE ACESSO\nEscritório: ${provisionSuccess.officeName}\nOAB: ${provisionSuccess.oab}\nLogin: ${provisionSuccess.lawyerEmail}\nSenha: ${lawyerPassword}\nAcesso: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    alert('Credenciais copiadas para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full pt-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-none">
              PreviOffice Admin
            </span>
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
              {t.adminProvisioning.pageBadge}
            </span>
          </div>
        </div>

        <LanguageSwitcher variant="pill" />
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center py-10 max-w-4xl mx-auto w-full">
        {!isUnlocked ? (
          /* ======================================================== */
          /* PHASE 1: Cryptographic Master Key Security Gate         */
          /* ======================================================== */
          <div className="bg-slate-800 text-slate-100 rounded-2xl border border-slate-700 shadow-2xl p-8 sm:p-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Autenticação Administrativa
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Informe a credencial autorizada para configurar o escritório.
              </p>
            </div>

            {gateError && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{gateError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyGate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Credencial de Acesso
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-slate-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingGate}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
              >
                {verifyingGate ? t.adminProvisioning.btnVerifying : t.adminProvisioning.btnUnlock}
              </button>
            </form>
          </div>
        ) : provisionSuccess ? (
          /* ======================================================== */
          /* SUCCESS SCREEN: Office Provisioned                       */
          /* ======================================================== */
          <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 shadow-2xl p-8 sm:p-10 w-full max-w-lg text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-white">
              {t.adminProvisioning.successTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              {t.adminProvisioning.successMessage}
            </p>

            <div className="mt-6 bg-slate-900/80 p-5 rounded-xl border border-slate-700 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Escritório:</span>
                <span className="text-white font-bold">{provisionSuccess.officeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">OAB:</span>
                <span className="text-[#C89543] font-bold">{provisionSuccess.oab}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Titular:</span>
                <span className="text-white">{provisionSuccess.lawyerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Login:</span>
                <span className="text-blue-400">{provisionSuccess.lawyerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Senha:</span>
                <span className="text-emerald-400 font-bold">{lawyerPassword}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={copyCredentials}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>{t.adminProvisioning.copyAccessData}</span>
              </button>

              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#C89543] text-[#0B192E] font-bold text-xs uppercase tracking-wider hover:bg-[#d5a557] flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Ir para a Página de Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PHASE 2: Office & Managing Lawyer Provisioning Form      */
          /* ======================================================== */
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

            <form onSubmit={handleProvisionOffice} className="space-y-6">
              {/* Section 1: Law Office Data */}
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
                      maxLength={18}
                      value={taxId}
                      onChange={(e) => setTaxId(maskCpfCnpj(e.target.value))}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {t.adminProvisioning.oabNumberLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={oabNumber}
                      onChange={(e) => setOabNumber(e.target.value)}
                      placeholder={t.adminProvisioning.oabNumberPlaceholder}
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {t.adminProvisioning.oabUfLabel}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={oabUf}
                      onChange={(e) => setOabUf(e.target.value.toUpperCase())}
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
                      placeholder="(83) 98888-0000"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white font-mono"
                    />
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
                      placeholder="contato@pontesadvocacia.com.br"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
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
                </div>
              </div>

              {/* Section 2: Managing Lawyer Account */}
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
                      placeholder="Dr. Alexandre Pontes"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {t.adminProvisioning.lawyerEmailLabel}
                    </label>
                    <input
                      type="email"
                      required
                      value={lawyerEmail}
                      onChange={(e) => setLawyerEmail(e.target.value)}
                      placeholder="dr.alexandre@pontesadvocacia.com.br"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      {t.adminProvisioning.lawyerPasswordLabel}
                    </label>
                    <input
                      type="password"
                      required
                      value={lawyerPassword}
                      onChange={(e) => setLawyerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={provisioning}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C89543] to-[#dfad5e] text-[#0B192E] font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
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
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-slate-500">
        PreviOffice Legal Platform · Private Administration Gate
      </footer>
    </div>
  );
}
