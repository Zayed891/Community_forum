"use client";

import { useTranslations } from "@/lib/i18n/context";

type Props = {
  hasSaved: boolean;
  savesCount: number;
  onToggle: () => void;
  disabled?: boolean;
};

export function BookmarkButton({ hasSaved, savesCount, onToggle, disabled }: Props) {
  const { t } = useTranslations();

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={hasSaved}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
        hasSaved
          ? "border-brand/20 bg-brand-light text-brand-dark"
          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill={hasSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3a1 1 0 0 0-1 1v17l7-4 7 4V4a1 1 0 0 0-1-1H6Z" />
      </svg>
      <span>{hasSaved ? t("bookmark.saved") : t("bookmark.save")}</span>
      <span className="text-gray-400">·</span>
      <span>{t("bookmark.count", { count: savesCount })}</span>
    </button>
  );
}
