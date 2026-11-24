'use client';

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { generateRandomPassword } from '@/lib/auth/password-generator';
import {
  AdminGateView,
  AdminProvisionSuccessView,
  AdminShareCredentialsModal,
  AdminOfficeForm,
} from '@/features/provisioning';

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
          <AdminGateView
            masterKey={masterKey}
            setMasterKey={setMasterKey}
            onVerifyGate={handleVerifyGate}
            verifyingGate={verifyingGate}
            gateError={gateError}
          />
        ) : provisionSuccess ? (
          <AdminProvisionSuccessView
            provisionSuccess={provisionSuccess}
            lawyerPassword={lawyerPassword}
            whatsAppUrl={getWhatsAppUrl(true)}
            onCopyCredentials={copyCredentials}
            copiedShareText={copiedShareText}
          />
        ) : (
          <AdminOfficeForm
            officeName={officeName}
            setOfficeName={setOfficeName}
            cnpj={cnpj}
            setCnpj={setCnpj}
            societyOab={societyOab}
            setSocietyOab={setSocietyOab}
            phone={phone}
            setPhone={setPhone}
            officeEmail={officeEmail}
            setOfficeEmail={setOfficeEmail}
            address={address}
            setAddress={setAddress}
            planType={planType}
            setPlanType={setPlanType}
            lawyerName={lawyerName}
            setLawyerName={setLawyerName}
            lawyerCpf={lawyerCpf}
            setLawyerCpf={setLawyerCpf}
            lawyerOabNumber={lawyerOabNumber}
            setLawyerOabNumber={setLawyerOabNumber}
            lawyerOabUf={lawyerOabUf}
            setLawyerOabUf={setLawyerOabUf}
            lawyerPhone={lawyerPhone}
            setLawyerPhone={setLawyerPhone}
            lawyerEmail={lawyerEmail}
            setLawyerEmail={setLawyerEmail}
            lawyerPassword={lawyerPassword}
            setLawyerPassword={setLawyerPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            copiedPassword={copiedPassword}
            setCopiedPassword={setCopiedPassword}
            onOpenShareModal={() => setShowShareModal(true)}
            onSubmit={handleProvisionOffice}
            provisioning={provisioning}
            provisionError={provisionError}
          />
        )}
      </main>

      {/* Share Credentials Modal */}
      <AdminShareCredentialsModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        lawyerName={lawyerName}
        lawyerEmail={lawyerEmail}
        lawyerPassword={lawyerPassword}
        shareText={getShareText(false)}
        whatsAppUrl={getWhatsAppUrl(false)}
        onCopyCredentials={copyCredentials}
        copiedShareText={copiedShareText}
      />

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-slate-500">
        PreviOffice Legal Platform · Private Administration Gate
      </footer>
    </div>
  );
}
