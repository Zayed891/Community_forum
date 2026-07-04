import { db } from "@/db/client";
import { enrollments } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function isEnrolled(userId: number, courseId: number): Promise<boolean> {
  const rows = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));

  return rows.length > 0;
}

/** Moderators can read any course's posts; students only their enrolled ones. */
export async function canAccessCourse(
  auth: { userId: number; role: "student" | "moderator" },
  courseId: number,
): Promise<boolean> {
  if (auth.role === "moderator") return true;
  return isEnrolled(auth.userId, courseId);
}
