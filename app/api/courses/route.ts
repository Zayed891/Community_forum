import { db } from "@/db/client";
import { courses, enrollments } from "@/db/schema";
import { getAuthContext } from "@/lib/auth";
import { Errors } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// List of courses the current user may pick in the UI: all courses for a
// moderator, only enrolled ones for a student.
export async function GET(request: Request) {
  const auth = getAuthContext(request);
  if (!auth) return Errors.unauthenticated();

  if (auth.role === "moderator") {
    return Response.json({ courses: await db.select().from(courses) });
  }

  const rows = await db
    .select({ id: courses.id, name: courses.name })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, auth.userId));

  return Response.json({ courses: rows });
}
