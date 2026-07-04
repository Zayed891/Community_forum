export type Role = "student" | "moderator";
export type AuthContext = { userId: number; role: Role };

/**
 * Auth is stubbed per the assignment: identity is read straight off request
 * headers, unverified. Nothing downstream should trust this for anything
 * beyond "who does the caller claim to be" — the actual access-control
 * decisions all happen in the authorization checks, not here.
 */
export function getAuthContext(request: Request): AuthContext | null {
  const userIdHeader = request.headers.get("x-user-id");
  const role = request.headers.get("x-role");

  if (!userIdHeader || !role) return null;

  const userId = Number(userIdHeader);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  if (role !== "student" && role !== "moderator") return null;

  return { userId, role };
}
