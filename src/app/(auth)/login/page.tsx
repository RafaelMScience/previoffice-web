'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Scale,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { settingsStore } from '@/lib/data/mock-settings';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // First Access Mandatory Change State
  const [isFirstAccessOpen, setIsFirstAccessOpen] = useState(false);
  const [newDefinitivePassword, setNewDefinitivePassword] = useState('');
  const [confirmDefinitivePassword, setConfirmDefinitivePassword] = useState('');
  const [firstAccessError, setFirstAccessError] = useState('');
  const [firstAccessSuccess, setFirstAccessSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Basic client validation
      if (!email || !password) {
        setErrorMessage(t.login.errorInvalidCredentials);
        setLoading(false);
        return;
      }

      // Check if user has mustChangePassword active in settings store
      const member = settingsStore.findMemberByEmail(email);
      if (member && member.mustChangePassword) {
        setIsFirstAccessOpen(true);
        setLoading(false);
        return;
      }

      // Simulate authentication check / Supabase auth session
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Successfully authenticated
      router.push('/');
    } catch {
      setErrorMessage(t.login.errorInvalidCredentials);
      setLoading(false);
    }
  };

  const handleSaveDefinitivePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstAccessError('');

    if (newDefinitivePassword.length < 6) {
      setFirstAccessError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newDefinitivePassword !== confirmDefinitivePassword) {
      setFirstAccessError('A confirmação de senha não confere.');
      return;
    }

    // Complete first access in store
    settingsStore.completeFirstAccessPassword(email);
    setFirstAccessSuccess(true);

    setTimeout(() => {
      setIsFirstAccessOpen(false);
      router.push('/');
    }, 1200);
  };

  const handleFillDemo = (role: 'LAWYER' | 'RECEPTION') => {
    if (role === 'LAWYER') {
      setEmail('dr.alexandre@pontesadvocacia.com.br');
      setPassword('Pontes@2026!');
    } else {
      setEmail('recepcao@pontesadvocacia.com.br');
      setPassword('Recepcao@2026!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-radial-[ellipse_at_top,_var(--tw-gradient-stops)] from-[#142642] via-[#0B192E] to-[#07111F] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header with Brand & Language Switcher */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C89543] to-[#dfad5e] flex items-center justify-center text-[#0B192E] font-extrabold text-lg shadow-md">
            §
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-none">
              PreviOffice
            </span>
            <span className="text-[10px] font-semibold text-[#C89543] uppercase tracking-wider">
              {t.navigation.brandSubtitle}
            </span>
          </div>
        </div>

        <LanguageSwitcher variant="pill" />
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-8 sm:p-10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192E] via-[#C89543] to-[#0B192E]" />

          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FDF8ED] border border-[#C89543]/30 text-[#C89543] mb-3 shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.login.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {t.login.subtitle}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.login.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t.login.passwordLabel}
                </label>
                <span className="text-[11px] text-[#C89543] hover:underline cursor-pointer">
                  {t.login.forgotPassword}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C89543] focus:ring-[#C89543] border-slate-300"
                />
                <span>{t.login.rememberMe}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#0B192E] text-white font-bold text-sm hover:bg-[#142642] flex items-center justify-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-50"
            >
              <span>{loading ? t.login.btnSubmitting : t.login.btnSubmit}</span>
              <ArrowRight className="w-4 h-4 text-[#C89543]" />
            </button>
          </form>

          {/* Demo Sandbox Quick-Fill Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] font-medium text-slate-400 mb-2.5">
              {t.login.demoNote}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('LAWYER')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                ⚖️ Advogado Titular
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('RECEPTION')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                📋 Recepção / Triagem
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Primeiro Acesso - Troca Obrigatória de Senha */}
      {isFirstAccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#082A52] to-[#0B192E] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Primeiro Acesso Detectado</h3>
                  <p className="text-xs text-slate-300">Troca obrigatória de senha temporária</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDefinitivePassword} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <p className="leading-relaxed">
                  Por diretriz de segurança do escritório <strong>Alexandre Pontes Advocacia</strong>, você deve cadastrar sua senha definitiva pessoal antes de prosseguir.
                </p>
              </div>

              {firstAccessSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Senha pessoal cadastrada! Entrando no sistema...</span>
                </div>
              )}

              {firstAccessError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{firstAccessError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nova Senha Definitiva <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newDefinitivePassword}
                    onChange={(e) => setNewDefinitivePassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Nova Senha <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmDefinitivePassword}
                    onChange={(e) => setConfirmDefinitivePassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={firstAccessSuccess}
                  className="w-full py-2.5 rounded-xl bg-[#082A52] hover:bg-[#0B3A70] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-[#C89543]" />
                  <span>Salvar Senha e Entrar no PreviOffice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Footer Badge */}
      <footer className="text-center py-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-[#C89543]" />
          <span>{t.login.securityBadge}</span>
        </div>
      </footer>
    </div>
  );
}
