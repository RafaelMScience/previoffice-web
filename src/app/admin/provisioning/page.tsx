'use client';

import React, { useState, useEffect } from 'react';
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
  Check,
  RefreshCw,
  AlertTriangle,
  Scale,
  Eye,
  EyeOff,
  MessageCircle,
  X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { maskCpfCnpj, maskPhone } from '@/lib/utils/masks';
import { generateRandomPassword } from '@/lib/auth/password-generator';

export default function AdminProvisioningPage() {
  const { t } = useI18n();

  // Gate state
  const [masterKey, setMasterKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verifyingGate, setVerifyingGate] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // Office form state (Pessoa Jurídica)
  const [officeName, setOfficeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [societyOab, setSocietyOab] = useState('');
  const [phone, setPhone] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [address, setAddress] = useState('');

  // Lawyer user state (Pessoa Física)
  const [lawyerName, setLawyerName] = useState('');
  const [lawyerCpf, setLawyerCpf] = useState('');
  const [lawyerOabNumber, setLawyerOabNumber] = useState('');
  const [lawyerOabUf, setLawyerOabUf] = useState('AM');
  const [lawyerPhone, setLawyerPhone] = useState('');
  const [lawyerEmail, setLawyerEmail] = useState('');
  const [lawyerPassword, setLawyerPassword] = useState(() => generateRandomPassword());
  const [showPassword, setShowPassword] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [planType, setPlanType] = useState('TRIAL_90_DAYS');

  useEffect(() => {
    if (!lawyerPassword) {
      setLawyerPassword(generateRandomPassword());
    }
  }, []);

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
      if (!lawyerPassword) {
        setLawyerPassword(generateRandomPassword());
      }
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
          cnpj,
          societyOab,
          taxId: cnpj,
          phone,
          officeEmail,
          address,
          lawyerName,
          lawyerCpf,
          lawyerOabNumber,
          lawyerOabUf,
          lawyerPhone: lawyerPhone || phone,
          lawyerEmail,
          lawyerPassword: lawyerPassword || generateRandomPassword(),
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

  const getShareText = (isFinalSuccess = false) => {
    const firmName = (isFinalSuccess ? provisionSuccess?.officeName : officeName)?.trim() || 'Escritório de Advocacia';
    const targetLawyer = (isFinalSuccess ? provisionSuccess?.lawyerName : lawyerName)?.trim() || 'Dr(a). Advogado(a)';
    const targetEmail = (isFinalSuccess ? provisionSuccess?.lawyerEmail : lawyerEmail)?.trim() || 'seu e-mail de acesso';
    const pass = isFinalSuccess ? (provisionSuccess?.temporaryPassword || lawyerPassword) : lawyerPassword;
    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://previoffice.vercel.app/login';

    return `🏛️ *PreviOffice - ${firmName}*\n` +
      `Olá, ${targetLawyer}! Seu acesso ao sistema do escritório foi configurado com sucesso:\n\n` +
      `🔗 *Link de Acesso:* ${loginUrl}\n` +
      `👤 *Login:* ${targetEmail}\n` +
      `🔑 *Senha Inicial de Acesso:* ${pass}\n\n` +
      `⚠️ *Atenção:* No seu 1º acesso, o sistema exigirá a troca desta senha provisória por uma senha pessoal definitiva para garantir a segurança dos dados do escritório.`;
  };

  const getWhatsAppUrl = (isFinalSuccess = false) => {
    const rawPhone = isFinalSuccess ? (provisionSuccess?.lawyerPhone || lawyerPhone || phone) : (lawyerPhone || phone);
    const cleanPhone = (rawPhone || '').replace(/\D/g, '');
    const ddiPhone = cleanPhone.startsWith('55') && cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
    const text = getShareText(isFinalSuccess);
    return cleanPhone
      ? `https://api.whatsapp.com/send?phone=${ddiPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const copyCredentials = () => {
    const text = getShareText(Boolean(provisionSuccess));
    navigator.clipboard.writeText(text).then(() => {
      setCopiedShareText(true);
      setTimeout(() => setCopiedShareText(false), 3000);
    }).catch(() => {
      alert('Erro ao copiar credenciais. Por favor, selecione e copie o texto manualmente.');
    });
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
                <span className="text-slate-500">Razão Social / Escritório:</span>
                <span className="text-white font-bold">{provisionSuccess.officeName}</span>
              </div>
              {provisionSuccess.officeCnpj && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">CNPJ da Sociedade:</span>
                  <span className="text-white font-bold">{provisionSuccess.officeCnpj}</span>
                </div>
              )}
              {provisionSuccess.societyOab && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">OAB da Sociedade:</span>
                  <span className="text-[#C89543] font-bold">{provisionSuccess.societyOab}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Advogado Titular:</span>
                <span className="text-white font-bold">{provisionSuccess.lawyerName}</span>
              </div>
              {provisionSuccess.lawyerCpf && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">CPF do Advogado:</span>
                  <span className="text-emerald-300 font-bold">{provisionSuccess.lawyerCpf}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">OAB do Advogado:</span>
                <span className="text-[#C89543] font-bold">{provisionSuccess.lawyerOab}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Login:</span>
                <span className="text-blue-400">{provisionSuccess.lawyerEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Senha Provisória:</span>
                <span className="text-emerald-400 font-bold font-mono tracking-wider">
                  {provisionSuccess.temporaryPassword || lawyerPassword}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-left text-xs text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">Troca de Senha Obrigatória no 1º Acesso</span>
                <span>Ao realizar o primeiro login com a senha provisória acima, o advogado será automaticamente redirecionado para cadastrar sua nova senha pessoal definitiva.</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppUrl(true)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar via WhatsApp (R$ 0,00)</span>
              </a>

              <button
                type="button"
                onClick={copyCredentials}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedShareText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedShareText ? 'Mensagem Copiada!' : t.adminProvisioning.copyAccessData}</span>
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
                        onClick={() => setShowShareModal(true)}
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

      {/* Share Credentials Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Compartilhar Senha Inicial de Acesso</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Envie as credenciais com custo R$ 0,00 via WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{lawyerName.trim() || 'Advogado Titular'}</div>
                  <div className="text-[11px] text-slate-400">{lawyerEmail.trim() || 'E-mail não informado'}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Senha Inicial</span>
                  <span className="font-mono font-extrabold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {lawyerPassword}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  <strong className="text-amber-200">Troca Obrigatória:</strong> No primeiro acesso, o advogado será forçado a definir uma senha definitiva pessoal.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Mensagem Pronta para WhatsApp</span>
                </label>
                <pre className="p-3.5 bg-slate-950 rounded-xl text-[11px] font-sans text-slate-300 border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {getShareText(false)}
                </pre>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={getWhatsAppUrl(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar via WhatsApp (R$ 0,00)</span>
                </a>

                <button
                  type="button"
                  onClick={copyCredentials}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {copiedShareText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShareText ? 'Mensagem Copiada!' : 'Copiar Mensagem'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-slate-500">
        PreviOffice Legal Platform · Private Administration Gate
      </footer>
    </div>
  );
}
