import { db } from "@/db/client";
import { users } from "@/db/schema";

// Not part of the forum's authorization surface — just powers the demo
// account switcher that stands in for a real login screen.
export async function GET() {
  const all = await db.select().from(users);
  return Response.json({ users: all });
}
