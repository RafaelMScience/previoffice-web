'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'compact' | 'sidebar';
  className?: string;
}

export function LanguageSwitcher({
  variant = 'pill',
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10 ${className}`}>
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <Globe className="w-3.5 h-3.5 text-[#C89543]" />
          <span>{t.common.language}</span>
        </div>
        <div className="flex items-center bg-black/30 rounded-md p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => setLocale('pt-BR')}
            title={t.common.portuguese}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              locale === 'pt-BR'
                ? 'bg-[#C89543] text-[#0B192E] shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🇧🇷 PT
          </button>
          <button
            type="button"
            onClick={() => setLocale('en-US')}
            title={t.common.english}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              locale === 'en-US'
                ? 'bg-[#C89543] text-[#0B192E] shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🇺🇸 EN
          </button>
        </div>
      </div>
    );
  }

  // Default 'pill' segmented switch for topbar
  return (
    <div
      className={`inline-flex items-center bg-slate-100 border border-slate-200/80 rounded-lg p-0.5 shadow-xs ${className}`}
      role="group"
      aria-label={locale === 'pt-BR' ? 'Seleção de idioma' : 'Language selection'}
    >
      <button
        type="button"
        onClick={() => setLocale('pt-BR')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-150 ${
          locale === 'pt-BR'
            ? 'bg-white text-[#0B192E] shadow-xs border border-slate-200/60 font-semibold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-pressed={locale === 'pt-BR'}
        title="Português (Brasil)"
      >
        <span className="text-xs" aria-hidden="true">🇧🇷</span>
        <span>PT</span>
      </button>

      <button
        type="button"
        onClick={() => setLocale('en-US')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-150 ${
          locale === 'en-US'
            ? 'bg-white text-[#0B192E] shadow-xs border border-slate-200/60 font-semibold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-pressed={locale === 'en-US'}
        title="English (United States)"
      >
        <span className="text-xs" aria-hidden="true">🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  );
}
