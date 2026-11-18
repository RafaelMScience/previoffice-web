'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { settingsStore } from '@/lib/data/mock-settings';
import type { UserProfile } from '@/types/settings';

export function ProfileSecurityTab() {
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState<UserProfile>(() => settingsStore.getUserProfile());

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Profile save feedback
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    settingsStore.updateUserProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(locale === 'pt-BR' ? 'Informe a senha atual' : 'Enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(locale === 'pt-BR' ? 'A nova senha deve ter pelo menos 6 caracteres' : 'New password must have at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(locale === 'pt-BR' ? 'A confirmação de senha não confere' : 'Password confirmation does not match');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Meu Perfil Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#082A52]/10 text-[#082A52] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#082A52]">{t.settings.profileTitle}</h2>
              <p className="text-xs text-slate-500">{t.settings.profileSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {profile.memberType === 'LAWYER'
                ? t.settings.lawyer
                : profile.memberType === 'ASSISTANT'
                ? t.settings.assistant
                : t.settings.intern}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          {profileSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t.settings.saveSuccess}</span>
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
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
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
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
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
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(83) 98888-0000"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-xs"
            >
              <Save className="w-4 h-4 text-[#C89543]" />
              {t.settings.btnSaveProfile}
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
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Senha de acesso atualizada com sucesso!</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 active:scale-98 transition-all shadow-xs"
            >
              <Lock className="w-4 h-4 text-[#C89543]" />
              {t.settings.btnUpdatePassword}
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
