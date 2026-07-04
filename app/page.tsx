"use client";

import { useState } from "react";
import { useCourses, useFeed, useRemovePost, useToggleSave } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/current-user-context";
import { useTranslations } from "@/lib/i18n/context";
import { CategoryList } from "@/components/CategoryList";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadMoreButton } from "@/components/LoadMoreButton";

export default function FeedPage() {
  const { t } = useTranslations();
  const { currentUser, users } = useCurrentUser();
  const { data: coursesData } = useCourses();
  const courses = coursesData?.courses ?? [];

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;

  const feed = useFeed(selectedCourseId ?? -1);
  const feedPosts = feed.data?.pages.flatMap((page) => page.posts) ?? [];
  const toggleSave = useToggleSave();
  const removePost = useRemovePost(selectedCourseId ?? -1);

  const authorName = (authorId: number) =>
    users.find((u) => u.id === authorId)?.name ?? "Unknown";

  if (!currentUser) return null;

  if (!selectedCourse) {
    return <CategoryList courses={courses} onSelect={setSelectedCourseId} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => setSelectedCourseId(null)}
        className="flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:-scale-x-100">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {t("feed.back")}
      </button>

      <h1 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h1>

      {feed.isLoading && <p className="text-gray-500">{t("feed.loading")}</p>}
      {feed.isError && <p className="text-red-500">{t("feed.error")}</p>}

      {feedPosts.length === 0 && !feed.isLoading && <EmptyState title={t("feed.empty")} />}

      {feedPosts.length > 0 && (
        <div className="flex flex-col gap-4">
          {feedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              authorName={authorName(post.authorId)}
              onToggleSave={() => toggleSave.mutate({ post, courseId: selectedCourseId! })}
              toggleDisabled={toggleSave.isPending}
              onRemove={
                currentUser.role === "moderator"
                  ? () => removePost.mutate(post.id)
                  : undefined
              }
            />
          ))}
          {feed.hasNextPage && (
            <LoadMoreButton
              onClick={() => feed.fetchNextPage()}
              loading={feed.isFetchingNextPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
