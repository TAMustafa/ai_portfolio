import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18next, { type Resource } from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import type { Lang, TranslationDict } from "./types";
import nl from "./nl.json";
import en from "./en.json";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
  dict: TranslationDict;
}

const I18N_STORAGE_KEY = "app.lang";
const DEFAULT_LANG: Lang = "nl";
const NS = "translation";

// Prepare resources for i18next from the existing translations.json shape
const resources: Resource = {
  nl: { [NS]: nl as unknown as TranslationDict },
  en: { [NS]: en as unknown as TranslationDict },
};

// Initialize i18next once (module scope)
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANG,
    fallbackLng: "en",
    ns: [NS],
    defaultNS: NS,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Persist language in localStorage (same key as before)
  const [lang, setLangState] = useState<Lang>(() => {
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem(I18N_STORAGE_KEY) as Lang | null)
        : null;
    return saved ?? (i18next.language as Lang) ?? DEFAULT_LANG;
  });

  // Keep i18next in sync when lang changes
  useEffect(() => {
    if (i18next.language !== lang) {
      i18next.changeLanguage(lang);
    }
  }, [lang]);

  const setLang = (value: Lang) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(I18N_STORAGE_KEY, value);
    }
  };

  // react-i18next hook for t function
  const { t: rt } = useTranslation();

  // Expose a dict similar to before (resource bundle for current lang)
  const dict = useMemo<TranslationDict>(() => {
    try {
      return i18next.getResourceBundle(lang, NS) as TranslationDict;
    } catch {
      return {} as TranslationDict;
    }
  }, [lang]);

  // Side effects: <html lang> and document title from brand
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      const brand = rt("common.brand");
      if (brand && typeof brand === "string") {
        document.title = `${brand} — Portfolio`;
      }
    }
  }, [lang, rt]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      dict,
      t: (path: string) => rt(path),
    }),
    [lang, dict, rt],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
