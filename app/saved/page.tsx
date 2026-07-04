"use client";

import { useSavedList, useToggleSave } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/current-user-context";
import { useTranslations } from "@/lib/i18n/context";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadMoreButton } from "@/components/LoadMoreButton";

export default function SavedPage() {
  const { t } = useTranslations();
  const { users } = useCurrentUser();
  const saved = useSavedList();
  const toggleSave = useToggleSave();
  const savedPosts = saved.data?.pages.flatMap((page) => page.posts) ?? [];

  const authorName = (authorId: number) =>
    users.find((u) => u.id === authorId)?.name ?? "Unknown";

  return (
    <div className="flex flex-col gap-6">
      {saved.isLoading && <p className="text-gray-500">{t("saved.loading")}</p>}
      {saved.isError && <p className="text-red-500">{t("saved.error")}</p>}

      {savedPosts.length === 0 && !saved.isLoading && (
        <EmptyState title={t("saved.empty")} hint={t("saved.empty.hint")} />
      )}

      {savedPosts.length > 0 && (
        <div className="flex flex-col gap-4">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              authorName={authorName(post.authorId)}
              onToggleSave={() => toggleSave.mutate({ post, courseId: post.courseId })}
              toggleDisabled={toggleSave.isPending}
            />
          ))}
          {saved.hasNextPage && (
            <LoadMoreButton
              onClick={() => saved.fetchNextPage()}
              loading={saved.isFetchingNextPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
