"use client";

import { useTranslations } from "@/lib/i18n/context";

type Props = {
  onClick: () => void;
  loading: boolean;
};

export function LoadMoreButton({ onClick, loading }: Props) {
  const { t } = useTranslations();

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-fit cursor-pointer self-center rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-default disabled:opacity-50"
    >
      {loading ? t("pagination.loading") : t("pagination.loadMore")}
    </button>
  );
}
