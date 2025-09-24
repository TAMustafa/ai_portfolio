import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';
import type { Lang, TranslationDict } from './types';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
  dict: TranslationDict;
}

const I18N_STORAGE_KEY = 'app.lang';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getNested(dict: TranslationDict, path: string): unknown {
  return path.split('.').reduce<unknown>((acc: any, key) => (acc ? acc[key] : undefined), dict);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(I18N_STORAGE_KEY) as Lang | null) : null;
    return saved ?? 'nl';
  });

  const setLang = (value: Lang) => {
    setLangState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(I18N_STORAGE_KEY, value);
    }
  };

  const dict = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      // Optional: update title subtly to match brand
      const brand = getNested(dict, 'common.brand');
      if (typeof brand === 'string') {
        document.title = `${brand} — Portfolio`;
      }
    }
  }, [lang, dict]);

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    dict,
    t: (path: string) => {
      const v = getNested(dict, path);
      return typeof v === 'string' ? v : String(v ?? path);
    },
  }), [lang, dict]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
