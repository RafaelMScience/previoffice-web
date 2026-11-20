'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Save,
  Info,
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { maskPhone } from '@/lib/utils/masks';
import { settingsStore } from '@/lib/data/mock-settings';
import { securityStore } from '@/lib/data/mock-security';
import type { UserProfile } from '@/types/settings';

export function ProfileSecurityTab() {
  const { t, locale } = useI18n();
  const { currentUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile>(() => ({
    id: currentUser?.id || '',
    tenantId: currentUser?.tenantId || '',
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone ? maskPhone(currentUser.phone) : '',
    memberType: currentUser?.memberType || 'LAWYER',
    oabNumber: currentUser?.oabNumber || '',
    twoFactorEnabled: false,
  }));

  // Synchronize when currentUser loads or changes
  useEffect(() => {
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        id: currentUser.id,
        tenantId: currentUser.tenantId,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone ? maskPhone(currentUser.phone) : '',
        memberType: currentUser.memberType,
        oabNumber: currentUser.oabNumber || '',
      }));
    }
  }, [currentUser]);

  // Loading & feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);

    try {
      const supabase = createClient();

      // 1. Update public.profiles table in Supabase
      const { error: dbError } = await (supabase.from('profiles') as any)
        .update({
          full_name: profile.fullName,
          phone: profile.phone || null,
          oab_number: profile.oabNumber || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (dbError) {
        setProfileError(`Erro ao atualizar no banco: ${dbError.message}`);
        return;
      }

      // 2. Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          phone: profile.phone || null,
          oab_number: profile.oabNumber || null,
        },
      });

      if (authError) {
        setProfileError(`Erro ao sincronizar com autenticação: ${authError.message}`);
        return;
      }

      // 3. Keep local store synchronized for compatibility
      settingsStore.updateUserProfile(profile);

      // 4. Refresh global AuthContext to instantly propagate name/OAB to sidebar & header
      await refreshUser();

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 4000);
    } catch (err: any) {
      setProfileError(err?.message || 'Erro inesperado ao salvar informações do perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(locale === 'pt-BR' ? 'Informe a senha atual' : 'Enter your current password');
      return;
    }

    const hasMinLength = newPassword.length >= 8;
    const hasUpperAndLower = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasMinLength || !hasUpperAndLower || !hasNumber || !hasSpecial) {
      setPasswordError(
        locale === 'pt-BR'
          ? 'A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais (!@#$%...)'
          : 'Password must have at least 8 characters, including uppercase, lowercase, numbers and special symbols (!@#$%...)'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        locale === 'pt-BR'
          ? 'A confirmação de senha não confere'
          : 'Password confirmation does not match'
      );
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const supabase = createClient();

      // Verify current password first to prevent unauthorized takeover
      if (!currentUser?.email) return;
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordError(
          locale === 'pt-BR'
            ? 'A senha atual informada está incorreta.'
            : 'The current password provided is incorrect.'
        );
        setIsUpdatingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      // Record audit event
      if (currentUser) {
        securityStore.logEvent({
          actorId: currentUser.id,
          actorName: currentUser.fullName,
          actorRole: currentUser.isAdminLawyer ? 'Advogado Sócio' : 'Advogado',
          action: 'RESET_PASSWORD',
          actionDescription: 'Atualizou sua senha pessoal definitiva no painel de configurações',
          targetResource: `Credencial de ${currentUser.fullName}`,
          ipAddress: '127.0.0.1 (Local)',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
          severity: 'INFO',
        });
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Erro ao alterar a senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Meu Perfil / Informações Pessoais Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#082A52]/10 text-[#082A52] flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-[#C89543]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#082A52]">{t.settings.profileTitle}</h2>
              <p className="text-xs text-slate-500">{t.settings.profileSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {currentUser?.isAdminLawyer
                ? (locale === 'pt-BR' ? 'Sócio Administrador' : 'Managing Partner')
                : profile.memberType === 'LAWYER'
                ? t.settings.lawyer
                : profile.memberType === 'ASSISTANT'
                ? t.settings.assistant
                : t.settings.intern}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          {profileSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{locale === 'pt-BR' ? 'Informações pessoais atualizadas com sucesso!' : t.settings.saveSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblFullName} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Nome Completo do Advogado/Operador"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.settings.lblEmail}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Credencial de Acesso</span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={profile.email}
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed font-medium text-slate-500 opacity-90"
                  title="O e-mail é o identificador de segurança da sua conta e não pode ser alterado diretamente pelo perfil."
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
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: maskPhone(e.target.value) })}
                  placeholder="(83) 98888-0000"
                  maxLength={15}
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            {profile.memberType === 'LAWYER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOabNumber}
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.oabNumber || ''}
                    onChange={(e) => setProfile({ ...profile, oabNumber: e.target.value })}
                    placeholder="OAB/PB 18.234"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-xs disabled:opacity-50"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C89543]" />
                  <span>Salvando no Banco...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#C89543]" />
                  <span>{t.settings.btnSaveProfile}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Alteração de Senha */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.settings.securityTitle}</h2>
            <p className="text-xs text-slate-500">{t.settings.securitySubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Senha de acesso atualizada com sucesso no Supabase Auth!</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblCurrentPassword} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblNewPassword} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.settings.lblConfirmPassword} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 active:scale-98 transition-all shadow-xs disabled:opacity-50"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C89543]" />
                  <span>Atualizando Senha...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#C89543]" />
                  <span>{t.settings.btnUpdatePassword}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 3. Autenticação em Dois Fatores (2FA) - NEUTRAL GRAY / DESATIVADO VISUAL */}
      <section className="bg-slate-50 rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-700">{t.settings.twoFactorTitle}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                  {t.settings.twoFactorStatusDisabled}
                </span>
              </div>
              <p className="text-xs text-slate-500">{t.settings.twoFactorSubtitle}</p>
            </div>
          </div>

          {/* Toggle disabled visual */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">OFF</span>
            <div
              className="w-12 h-6 bg-slate-300 rounded-full p-1 cursor-not-allowed opacity-80 flex items-center"
              title="2FA preparado para futura ativação"
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-0" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-700">Módulo 2FA Pronto para Ativação Futura</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.settings.twoFactorDisabledNotice}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 opacity-70">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-600 mb-1">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span>Aplicativo Autenticador (TOTP)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Compatível com Google Authenticator, Microsoft Authenticator e 1Password.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 opacity-70">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-600 mb-1">
                <Shield className="w-4 h-4 text-slate-500" />
                <span>Códigos de Recuperação</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Códigos de emergência para resgate imediato da conta em caso de perda do dispositivo.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed opacity-75"
            >
              <Smartphone className="w-4 h-4" />
              {t.settings.btnActivate2Fa} (Em breve)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
