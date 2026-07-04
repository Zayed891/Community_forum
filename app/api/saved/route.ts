import { db } from "@/db/client";
import { posts, savedPosts } from "@/db/schema";
import { getAuthContext } from "@/lib/auth";
import { Errors } from "@/lib/api-response";
import { hydrateSaveFlags } from "@/lib/hydrate-saves";
import { parsePagination } from "@/lib/validation";
import { and, desc, eq } from "drizzle-orm";

// Returns only the current user's own saved list — there is no userId
// parameter to accept here, by design, so there's no way to request
// someone else's saved posts.
export async function GET(request: Request) {
  const auth = getAuthContext(request);
  if (!auth) return Errors.unauthenticated();

  const { limit, offset } = parsePagination(new URL(request.url).searchParams);

  const rows = await db
    .select({ post: posts, savedAt: savedPosts.updatedAt })
    .from(savedPosts)
    .innerJoin(posts, eq(savedPosts.postId, posts.id))
    .where(and(eq(savedPosts.userId, auth.userId), eq(savedPosts.isActive, true)))
    .orderBy(desc(savedPosts.updatedAt))
    .limit(limit)
    .offset(offset);

  const flags = await hydrateSaveFlags(
    rows.map((r) => r.post.id),
    auth.userId,
  );

  return Response.json({
    posts: rows.map((r) => ({
      ...r.post,
      ...flags.get(r.post.id)!,
      savedAt: r.savedAt,
    })),
    limit,
    offset,
  });
}
