"use client";

import { useTranslations } from "@/lib/i18n/context";
import { BookmarkButton } from "./BookmarkButton";
import type { Post } from "@/lib/types";

type Props = {
  post: Post;
  authorName: string;
  onToggleSave: () => void;
  toggleDisabled?: boolean;
  onRemove?: () => void;
};

export function PostCard({ post, authorName, onToggleSave, toggleDisabled, onRemove }: Props) {
  const { t } = useTranslations();

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{post.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("post.by", { name: authorName })}</p>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label={t("moderator.remove")}
            title={t("moderator.remove")}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-3 text-gray-700">{post.body}</p>
      <div className="mt-4">
        <BookmarkButton
          hasSaved={post.hasSaved}
          savesCount={post.savesCount}
          onToggle={onToggleSave}
          disabled={toggleDisabled}
        />
      </div>
    </article>
  );
}
