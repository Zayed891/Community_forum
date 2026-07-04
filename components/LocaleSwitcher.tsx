"use client";

import { useTranslations, type Locale } from "@/lib/i18n/context";
import { Dropdown } from "./Dropdown";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "ar", label: "AR" },
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useTranslations();

  return <Dropdown value={locale} onChange={setLocale} options={OPTIONS} className="w-20" />;
}
