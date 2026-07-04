import { db } from "@/db/client";
import { savedPosts } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

export type SaveFlags = { hasSaved: boolean; savesCount: number };

/**
 * Computes hasSaved/savesCount for a batch of posts in two queries total,
 * regardless of how many posts are in the page — avoids N+1 queries when
 * hydrating a feed or saved-list page.
 */
export async function hydrateSaveFlags(
  postIds: number[],
  userId: number,
): Promise<Map<number, SaveFlags>> {
  const result = new Map<number, SaveFlags>();
  for (const id of postIds) result.set(id, { hasSaved: false, savesCount: 0 });

  if (postIds.length === 0) return result;

  const counts = await db
    .select({ postId: savedPosts.postId, count: sql<number>`count(*)` })
    .from(savedPosts)
    .where(and(inArray(savedPosts.postId, postIds), eq(savedPosts.isActive, true)))
    .groupBy(savedPosts.postId);

  for (const row of counts) {
    const entry = result.get(row.postId);
    if (entry) entry.savesCount = Number(row.count);
  }

  const mine = await db
    .select({ postId: savedPosts.postId })
    .from(savedPosts)
    .where(
      and(
        inArray(savedPosts.postId, postIds),
        eq(savedPosts.userId, userId),
        eq(savedPosts.isActive, true),
      ),
    );

  for (const row of mine) {
    const entry = result.get(row.postId);
    if (entry) entry.hasSaved = true;
  }

  return result;
}
