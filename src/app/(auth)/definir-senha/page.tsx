'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { createClient } from '@/lib/supabase/client';
import { settingsStore } from '@/lib/data/mock-settings';
import type { MemberType, TeamMember } from '@/types/settings';

const STORAGE_EMAIL_KEY = 'previoffice_first_access_email';

export default function DefinirSenhaPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { switchUser, refreshUser } = useAuth();

  // State
  const [operatorEmail, setOperatorEmail] = useState<string>('');
  const [operatorMember, setOperatorMember] = useState<TeamMember | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize operator email safely from Supabase Auth & verified sessionStorage
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkSession() {
      let email = '';
      if (typeof window !== 'undefined') {
        email = sessionStorage.getItem(STORAGE_EMAIL_KEY) || '';
      }

      // 1. Check active Supabase Auth user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const activeEmail = user.email || email;
      const mustChange = user.user_metadata?.must_change_password === true;

      if (!mustChange) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(STORAGE_EMAIL_KEY);
        }
        router.push('/');
        return;
      }

      if (isMounted) {
        setOperatorEmail(activeEmail);
      }

      // 2. Fetch profile from Supabase
      if (user) {
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile && isMounted) {
          const role = profile.role;
          const memberType: MemberType =
            role === 'RECEPTIONIST' || role === 'ASSISTANT'
              ? 'ASSISTANT'
              : role === 'INTERN'
              ? 'INTERN'
              : 'LAWYER';

          setOperatorMember({
            id: profile.id,
            tenantId: profile.tenant_id,
            fullName: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            memberType,
            oabNumber: profile.oab_number,
            isAdminLawyer: role === 'MANAGING_LAWYER',
            active: profile.is_active,
            permissions: user.user_metadata?.permissions || {
              receptionDesk: true,
              clientsManage: true,
              casesManage: true,
              contractsAndFinancial: true,
              templatesManage: true,
              adminSettings: role === 'MANAGING_LAWYER',
              securityAudit: role === 'MANAGING_LAWYER',
            },
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          });
        }
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Password Security Criteria Validation
  const criteria = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUpperAndLower = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    const score = [hasMinLength, hasUpperAndLower, hasNumber, hasSpecial].filter(Boolean).length;

    let strengthLabel = t.firstAccess.strengthWeak;
    let strengthColor = 'bg-rose-500';
    let strengthTextColor = 'text-rose-600';
    let progressPercent = 25;

    if (score === 1) {
      strengthLabel = t.firstAccess.strengthWeak;
      strengthColor = 'bg-rose-500';
      strengthTextColor = 'text-rose-600';
      progressPercent = 25;
    } else if (score === 2) {
      strengthLabel = t.firstAccess.strengthMedium;
      strengthColor = 'bg-amber-500';
      strengthTextColor = 'text-amber-600';
      progressPercent = 50;
    } else if (score === 3) {
      strengthLabel = t.firstAccess.strengthGood;
      strengthColor = 'bg-blue-600';
      strengthTextColor = 'text-blue-600';
      progressPercent = 75;
    } else if (score === 4) {
      strengthLabel = t.firstAccess.strengthStrong;
      strengthColor = 'bg-emerald-600';
      strengthTextColor = 'text-emerald-600';
      progressPercent = 100;
    }

    const allValid = score === 4;

    return {
      hasMinLength,
      hasUpperAndLower,
      hasNumber,
      hasSpecial,
      score,
      allValid,
      strengthLabel,
      strengthColor,
      strengthTextColor,
      progressPercent,
    };
  }, [newPassword, t]);

  // Passwords match validation
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!criteria.allValid) {
      setSubmitError(t.firstAccess.reqLength + ' + ' + t.firstAccess.reqSpecial);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError(t.firstAccess.matchError);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Update password in Supabase Auth and reset must_change_password flag
      const { error: authUpdateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          must_change_password: false,
        },
      });

      if (authUpdateError) {
        setSubmitError(authUpdateError.message || t.firstAccess.errorGeneral);
        setLoading(false);
        return;
      }

      // 2. Update last_login_at in public.profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase.from('profiles') as any)
          .update({
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      // 3. Clear pending session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_EMAIL_KEY);
      }

      // 4. Update memory cache and context
      await refreshUser();

      setSuccess(true);

      // Smooth transition to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err: any) {
      setSubmitError(err?.message || t.firstAccess.errorGeneral);
      setLoading(false);
    }
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

      {/* Main Definir Senha Card Container */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg p-6 sm:p-9 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Brand Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B192E] via-[#C89543] to-[#0B192E]" />

          {/* Badge & Title Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF8ED] border border-[#C89543]/40 text-[#A06E28] text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              <KeyRound className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{t.firstAccess.badge}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.firstAccess.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {t.firstAccess.subtitle}
            </p>
          </div>

          {/* Operator Welcome & Identity Banner */}
          {operatorMember ? (
            <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#082A52] text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs border border-white/20">
                  {operatorMember.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{t.firstAccess.operatorGreeting}, {operatorMember.fullName}</span>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {operatorMember.email} •{' '}
                    <span className="font-semibold text-[#082A52]">
                      {operatorMember.memberType === 'LAWYER'
                        ? t.firstAccess.roleLawyer
                        : operatorMember.memberType === 'ASSISTANT'
                        ? t.firstAccess.roleAssistant
                        : t.firstAccess.roleIntern}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.firstAccess.securityBanner}</span>
            </div>
          )}

          {/* Feedback Alerts */}
          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{t.firstAccess.successMessage}</span>
            </div>
          )}

          {submitError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Password Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: New Definitive Password */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                {t.firstAccess.newPasswordLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.firstAccess.newPasswordPlaceholder}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-900 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-slate-500">{t.firstAccess.strengthLabel}</span>
                    <span className={criteria.strengthTextColor}>
                      {criteria.strengthLabel}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={criteria.progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t.firstAccess.strengthLabel}
                    className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden"
                  >
                    <div
                      className={`h-full ${criteria.strengthColor} transition-all duration-300 rounded-full`}
                      style={{ width: `${criteria.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input 2: Confirm Definitive Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                {t.firstAccess.confirmPasswordLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.firstAccess.confirmPasswordPlaceholder}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-900 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Match Feedback Badge */}
              {passwordsMatch !== null && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t.firstAccess.matchSuccess}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-rose-600">{t.firstAccess.matchError}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Checklist of 4 Security Criteria */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
                <span>{t.firstAccess.criteriaTitle}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <li
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    criteria.hasMinLength ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {criteria.hasMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{t.firstAccess.reqLength}</span>
                </li>

                <li
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    criteria.hasUpperAndLower ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {criteria.hasUpperAndLower ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{t.firstAccess.reqLetters}</span>
                </li>

                <li
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    criteria.hasNumber ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {criteria.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{t.firstAccess.reqNumbers}</span>
                </li>

                <li
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    criteria.hasSpecial ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {criteria.hasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{t.firstAccess.reqSpecial}</span>
                </li>
              </ul>
            </div>

            {/* LGPD & Ethical Secrecy Notice */}
            <div className="p-3 rounded-xl bg-[#082A52]/5 border border-[#082A52]/10 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C89543] shrink-0 mt-0.5" />
              <span>{t.firstAccess.lgpdNotice}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success || !criteria.allValid || passwordsMatch !== true}
              className="w-full mt-2 py-3 rounded-xl bg-[#0B192E] text-white font-bold text-xs sm:text-sm hover:bg-[#142642] flex items-center justify-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4 text-[#C89543]" />
              <span>{loading ? t.firstAccess.btnSubmitting : t.firstAccess.btnSubmit}</span>
              <ArrowRight className="w-4 h-4 text-[#C89543]" />
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-[#082A52] transition-colors"
            >
              ← {t.firstAccess.backToLogin}
            </Link>
          </div>
        </div>
      </main>

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
