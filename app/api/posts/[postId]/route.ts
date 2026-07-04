import { db } from "@/db/client";
import { posts } from "@/db/schema";
import { getAuthContext } from "@/lib/auth";
import { errorResponse, Errors } from "@/lib/api-response";
import { idParamSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const auth = getAuthContext(request);
  if (!auth) return Errors.unauthenticated();

  if (auth.role !== "moderator") {
    return errorResponse(403, "Only moderators can remove posts.");
  }

  const parsedPostId = idParamSchema.safeParse((await params).postId);
  if (!parsedPostId.success) return Errors.postNotFound();
  const postId = parsedPostId.data;

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) return Errors.postNotFound();

  await db.delete(posts).where(eq(posts.id, postId));

  return new Response(null, { status: 204 });
}
