'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Building2,
  Users,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { ProfileSecurityTab } from '@/components/settings/profile-security-tab';
import { OfficeSettingsTab } from '@/components/settings/office-settings-tab';
import { TeamManagementTab } from '@/components/settings/team-management-tab';

function SettingsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = (searchParams.get('tab') as 'profile' | 'office' | 'team') || 'profile';

  const setTab = (tab: 'profile' | 'office' | 'team') => {
    router.push(`/settings?tab=${tab}`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Executive Page Header */}
      <div className="bg-gradient-to-r from-[#082A52] to-[#0B192E] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#C89543]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#C89543]/20 text-[#C89543] border border-[#C89543]/30">
              <Settings className="w-3.5 h-3.5" />
              <span>Painel Administrativo da Banca</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.settings.pageTitle}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              {t.settings.pageSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[130px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                Segurança Ativa
              </div>
              <div className="text-sm font-bold text-[#C89543] flex items-center justify-center gap-1.5 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>TLS 1.3 / RLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 mt-8 border-t border-white/10 pt-4 overflow-x-auto">
          <button
            onClick={() => setTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'profile'
                ? 'bg-white text-[#082A52] shadow-md ring-2 ring-[#C89543]/40'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className={`w-4 h-4 ${currentTab === 'profile' ? 'text-[#C89543]' : 'text-white/60'}`} />
            <span>{t.settings.tabProfile}</span>
          </button>

          <button
            onClick={() => setTab('office')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'office'
                ? 'bg-white text-[#082A52] shadow-md ring-2 ring-[#C89543]/40'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className={`w-4 h-4 ${currentTab === 'office' ? 'text-[#C89543]' : 'text-white/60'}`} />
            <span>{t.settings.tabOffice}</span>
          </button>

          <button
            onClick={() => setTab('team')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'team'
                ? 'bg-white text-[#082A52] shadow-md ring-2 ring-[#C89543]/40'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className={`w-4 h-4 ${currentTab === 'team' ? 'text-[#C89543]' : 'text-white/60'}`} />
            <span>{t.settings.tabTeam}</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === 'profile' && <ProfileSecurityTab />}
        {currentTab === 'office' && <OfficeSettingsTab />}
        {currentTab === 'team' && <TeamManagementTab />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Carregando configurações da banca...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
