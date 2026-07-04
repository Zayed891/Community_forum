import { beforeAll, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db/client";
import { seed } from "@/db/seed";
import { GET as getFeed } from "@/app/api/courses/[courseId]/feed/route";
import { POST as savePost } from "@/app/api/posts/[postId]/save/route";
import { GET as getSaved } from "@/app/api/saved/route";

let fixtures: Awaited<ReturnType<typeof seed>>;

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  fixtures = await seed();
});

function req(url: string, opts: { userId?: number; role?: string; method?: string } = {}) {
  const headers = new Headers();
  if (opts.userId !== undefined) headers.set("x-user-id", String(opts.userId));
  if (opts.role !== undefined) headers.set("x-role", opts.role);
  return new Request(url, { method: opts.method ?? "GET", headers });
}

describe("GET /api/courses/:courseId/feed", () => {
  it("401s when there is no auth header", async () => {
    const res = await getFeed(req("http://test/api/courses/1/feed"), {
      params: Promise.resolve({ courseId: String(fixtures.math.id) }),
    });
    expect(res.status).toBe(401);
  });

  it("403s when a student requests a course they are not enrolled in", async () => {
    // Bob is enrolled in Math only, not History.
    const res = await getFeed(
      req("http://test/api/courses/1/feed", { userId: fixtures.bob.id, role: "student" }),
      { params: Promise.resolve({ courseId: String(fixtures.history.id) }) },
    );
    expect(res.status).toBe(403);
  });

  it("404s for a course that does not exist", async () => {
    const res = await getFeed(
      req("http://test/api/courses/1/feed", { userId: fixtures.alice.id, role: "student" }),
      { params: Promise.resolve({ courseId: "999999" }) },
    );
    expect(res.status).toBe(404);
  });

  it("happy path: returns the course feed with hydrated save flags", async () => {
    const res = await getFeed(
      req("http://test/api/courses/1/feed", { userId: fixtures.alice.id, role: "student" }),
      { params: Promise.resolve({ courseId: String(fixtures.math.id) }) },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.posts.length).toBeGreaterThan(0);
    expect(body.posts[0]).toHaveProperty("hasSaved");
    expect(body.posts[0]).toHaveProperty("savesCount");
  });
});

describe("POST /api/posts/:postId/save", () => {
  it("happy path: saving is idempotent and reflected in the caller's own saved list", async () => {
    const post = fixtures.posts[2]; // "Integration by parts examples", not pre-saved by Alice

    const first = await savePost(
      req("http://test/api/posts/1/save", {
        userId: fixtures.alice.id,
        role: "student",
        method: "POST",
      }),
      { params: Promise.resolve({ postId: String(post.id) }) },
    );
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    expect(firstBody).toEqual({ hasSaved: true, savesCount: 1 });

    // Saving again should be a no-op, not a double-count.
    const second = await savePost(
      req("http://test/api/posts/1/save", {
        userId: fixtures.alice.id,
        role: "student",
        method: "POST",
      }),
      { params: Promise.resolve({ postId: String(post.id) }) },
    );
    const secondBody = await second.json();
    expect(secondBody).toEqual({ hasSaved: true, savesCount: 1 });

    const savedRes = await getSaved(
      req("http://test/api/saved", { userId: fixtures.alice.id, role: "student" }),
    );
    const savedBody = await savedRes.json();
    expect(savedBody.posts.some((p: { id: number }) => p.id === post.id)).toBe(true);
  });

  it("403s when a student saves a post outside their enrolled course", async () => {
    // Carol is enrolled in History only; this post is in Math.
    const mathPost = fixtures.posts[0];
    const res = await savePost(
      req("http://test/api/posts/1/save", {
        userId: fixtures.carol.id,
        role: "student",
        method: "POST",
      }),
      { params: Promise.resolve({ postId: String(mathPost.id) }) },
    );
    expect(res.status).toBe(403);
  });

  it("404s when saving a post that does not exist", async () => {
    const res = await savePost(
      req("http://test/api/posts/1/save", {
        userId: fixtures.alice.id,
        role: "student",
        method: "POST",
      }),
      { params: Promise.resolve({ postId: "999999" }) },
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /api/saved", () => {
  it("only ever returns the caller's own saved list", async () => {
    const aliceSaved = await (
      await getSaved(req("http://test/api/saved", { userId: fixtures.alice.id, role: "student" }))
    ).json();
    const bobSaved = await (
      await getSaved(req("http://test/api/saved", { userId: fixtures.bob.id, role: "student" }))
    ).json();

    const aliceIds = aliceSaved.posts.map((p: { id: number }) => p.id).sort();
    const bobIds = bobSaved.posts.map((p: { id: number }) => p.id).sort();

    // Alice and Bob each saved "Help with derivatives" but not identical sets overall.
    expect(aliceIds).not.toEqual(bobIds);
  });
});
