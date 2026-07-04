import { db } from "@/db/client";
import { posts, courses } from "@/db/schema";
import { getAuthContext } from "@/lib/auth";
import { canAccessCourse } from "@/lib/authorization";
import { Errors } from "@/lib/api-response";
import { hydrateSaveFlags } from "@/lib/hydrate-saves";
import { idParamSchema, parsePagination } from "@/lib/validation";
import { desc, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const auth = getAuthContext(request);
  if (!auth) return Errors.unauthenticated();

  const parsedCourseId = idParamSchema.safeParse((await params).courseId);
  if (!parsedCourseId.success) return Errors.courseNotFound(); // malformed id, no such course
  const courseId = parsedCourseId.data;

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
  if (!course) return Errors.courseNotFound();

  if (!(await canAccessCourse(auth, courseId))) return Errors.forbidden();

  const { limit, offset } = parsePagination(new URL(request.url).searchParams);

  const page = await db
    .select()
    .from(posts)
    .where(eq(posts.courseId, courseId))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const flags = await hydrateSaveFlags(page.map((p) => p.id), auth.userId);

  return Response.json({
    posts: page.map((post) => ({
      ...post,
      ...flags.get(post.id)!,
    })),
    limit,
    offset,
  });
}
