import { db } from "@/db/client";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthContext } from "./auth";
import { canAccessCourse } from "./authorization";
import { Errors } from "./api-response";
import { applySaveAction } from "./save-posts-service";
import { idParamSchema } from "./validation";
import type { SaveAction } from "./save-posts";

export async function handleSaveAction(
  request: Request,
  postIdParam: string,
  action: SaveAction,
) {
  const auth = getAuthContext(request);
  if (!auth) return Errors.unauthenticated();

  const parsedPostId = idParamSchema.safeParse(postIdParam);
  if (!parsedPostId.success) return Errors.postNotFound();
  const postId = parsedPostId.data;

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) return Errors.postNotFound();

  if (!(await canAccessCourse(auth, post.courseId))) return Errors.forbidden();

  const flags = await applySaveAction(auth.userId, postId, action);
  return Response.json(flags);
}
