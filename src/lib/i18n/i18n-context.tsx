'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Locale, Translations } from './types';
import { enTranslations } from './dictionaries/en';
import { ptTranslations } from './dictionaries/pt';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const dictionaries: Record<Locale, Translations> = {
  'pt-BR': ptTranslations,
  'en-US': enTranslations,
};

const I18nContext = createContext<I18nContextType>({
  locale: 'pt-BR',
  setLocale: () => {},
  t: ptTranslations,
});

const STORAGE_KEY = 'previoffice_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === 'pt-BR' || saved === 'en-US')) {
        setLocaleState(saved);
      } else {
        // Detect browser preference
        const navLang = navigator.language.toLowerCase();
        if (navLang.startsWith('en')) {
          setLocaleState('en-US');
        } else {
          setLocaleState('pt-BR');
        }
      }
    } catch {
      // Fallback in case localStorage is restricted
      setLocaleState('pt-BR');
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === 'pt-BR' ? 'pt-BR' : 'en';
    } catch {
      // Local storage disabled
    }
  }, []);

  const t = useMemo(() => dictionaries[locale] || ptTranslations, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
