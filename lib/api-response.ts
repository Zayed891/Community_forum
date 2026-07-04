export function errorResponse(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export const Errors = {
  unauthenticated: () => errorResponse(401, "Authentication required."),
  forbidden: () => errorResponse(403, "You do not have access to this course."),
  postNotFound: () => errorResponse(404, "Post not found."),
  courseNotFound: () => errorResponse(404, "Course not found."),
};
