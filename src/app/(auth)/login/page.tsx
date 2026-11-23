'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { currentUser, isAuthenticated } = useAuth();
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard or definir-senha
  useEffect(() => {
    if (currentUser) {
      if (currentUser.mustChangePassword) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('previoffice_first_access_email', currentUser.email);
        }
        router.push('/definir-senha');
      } else if (isAuthenticated) {
        router.push('/');
      }
    }
  }, [isAuthenticated, currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setErrorMessage(t.login.errorInvalidCredentials);
        setLoading(false);
        return;
      }

      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos. Verifique suas credenciais.'
            : error.message
        );
        setLoading(false);
        return;
      }

      if (data.session && data.user) {
        // Fetch profile to verify if user is active
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('is_active')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          setErrorMessage('Seu usuário está desativado pelo administrador. Entre em contato com a banca.');
          setLoading(false);
          return;
        }

        // Record last login in public.profiles
        try {
          await (supabase.from('profiles') as any)
            .update({
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id);
        } catch {
          // Handled gracefully in background
        }

        // 2. Check if user must change temporary password on first access
        const mustChange = data.user.user_metadata?.must_change_password === true;
        if (mustChange) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('previoffice_first_access_email', data.user.email || email.trim());
          }
          window.location.href = '/definir-senha';
          return;
        }

        window.location.href = '/';
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t.login.errorInvalidCredentials);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192E] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar with Language Switcher */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C89543] to-[#8C6425] flex items-center justify-center shadow-lg shadow-[#C89543]/20">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">PreviOffice</span>
            <span className="text-[10px] block text-[#C89543] uppercase tracking-widest font-semibold">
              Jurisprudência & Triagem
            </span>
          </div>
        </div>

        <LanguageSwitcher />
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/20 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#0B192E]/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Lock className="w-6 h-6 text-[#C89543]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Acesso ao Sistema
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Ambiente Restrito e Seguro
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs animate-shake"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} action="#" method="POST" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail Profissional
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advogado@previoffice.adv.br"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89543]/40 focus:border-[#C89543] transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89543]/40 focus:border-[#C89543] transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0B192E] to-[#1E293B] hover:from-[#152744] hover:to-[#2A3B52] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C89543]" />
                  <span>Validando Credenciais...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Escritório</span>
                  <ArrowRight className="w-4 h-4 text-[#C89543] group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#C89543]" />
            <span>Sessão protegida</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 max-w-7xl mx-auto w-full">
        <p>© 2026 PreviOffice — Gestão Especializada para Advocacia Previdenciária</p>
      </footer>
    </div>
  );
}
