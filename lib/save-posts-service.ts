import { db } from "@/db/client";
import { savedPosts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { decideSaveTransition, type SaveAction, type SavedPostState } from "./save-posts";
import { hydrateSaveFlags, type SaveFlags } from "./hydrate-saves";

/**
 * API-layer glue: fetches the current row, asks the pure Layer 2 logic what
 * should happen, then executes that decision. The unique (user_id, post_id)
 * constraint on saved_posts backs this up at the DB level in case of a race.
 */
export async function applySaveAction(
  userId: number,
  postId: number,
  action: SaveAction,
): Promise<SaveFlags> {
  const [existing] = await db
    .select()
    .from(savedPosts)
    .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)));

  const currentState: SavedPostState = !existing
    ? "none"
    : existing.isActive
      ? "active"
      : "inactive";

  const decision = decideSaveTransition(currentState, action);

  switch (decision) {
    case "create":
      await db.insert(savedPosts).values({ userId, postId, isActive: true });
      break;
    case "reactivate":
      await db
        .update(savedPosts)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(savedPosts.id, existing!.id));
      break;
    case "deactivate":
      await db
        .update(savedPosts)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(savedPosts.id, existing!.id));
      break;
    case "noop":
      break;
  }

  const flags = await hydrateSaveFlags([postId], userId);
  return flags.get(postId)!;
}
