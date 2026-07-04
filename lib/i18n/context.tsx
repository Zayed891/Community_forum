"use client";

import { createContext, useContext, useMemo, useState } from "react";
import en from "./en.json";
import es from "./es.json";

export type Locale = "en" | "es";

const catalogs: Record<Locale, Record<string, string>> = { en, es };

type Params = Record<string, string | number>;

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) =>
    key in params ? String(params[key]) : `{{${key}}}`,
  );
}

type TranslateFn = (key: string, params?: Params) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useMemo<TranslateFn>(() => {
    const catalog = catalogs[locale];
    const pluralRules = new Intl.PluralRules(locale);

    return (key, params) => {
      // Plural keys are stored as "base.key.one" / "base.key.other" etc.
      // If a bare "count" param is present, resolve the plural category
      // (Intl.PluralRules handles this correctly per-locale, rather than
      // hardcoding English's singular/plural split).
      if (params && "count" in params) {
        const category = pluralRules.select(Number(params.count));
        const pluralKey = `${key}.${category}`;
        const template = catalog[pluralKey] ?? catalog[`${key}.other`];
        if (template) return interpolate(template, params);
      }

      const template = catalog[key] ?? key;
      return interpolate(template, params);
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations must be used within LocaleProvider");
  return ctx;
}
