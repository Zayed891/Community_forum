"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.json";
import es from "./es.json";
import ar from "./ar.json";

export type Locale = "en" | "es" | "ar";

const catalogs: Record<Locale, Record<string, string>> = { en, es, ar };
const RTL_LOCALES = new Set<Locale>(["ar"]);

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

  // <html> is rendered server-side with no knowledge of client locale state,
  // so direction/lang are applied here as a side effect rather than JSX props.
  useEffect(() => {
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useMemo<TranslateFn>(() => {
    const catalog = catalogs[locale];
    const pluralRules = new Intl.PluralRules(locale);

    return (key, params) => {
      // Plural keys are stored as "base.key.one" / "base.key.other" etc.
      // If a bare "count" param is present, resolve the plural category
      // (Intl.PluralRules handles this correctly per-locale, rather than
      // hardcoding English's singular/plural split — e.g. Arabic's six
      // categories: zero/one/two/few/many/other).
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
