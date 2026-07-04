"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/i18n/context";
import { UserSwitcher } from "./UserSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function NavBar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (href: string) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-brand-light text-brand-dark"
        : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/thekey-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
            {t("app.title")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <UserSwitcher />
            <LocaleSwitcher />
          </div>

          <div className="relative md:hidden">
            <button
              type="button"
              aria-label={t("header.menu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="cursor-pointer rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute end-0 z-10 mt-2 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <UserSwitcher />
                <LocaleSwitcher />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 pb-3 sm:px-6">
        <Link href="/" className={linkClass("/")}>
          {t("nav.feed")}
        </Link>
        <Link href="/saved" className={linkClass("/saved")}>
          {t("nav.saved")}
        </Link>
      </div>
    </div>
  );
}
