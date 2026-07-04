import type { Course, Post, PostsPage, Role, SavedPost } from "./types";

export type AuthHeaders = { id: number; role: Role };

function authHeaders({ id, role }: AuthHeaders): HeadersInit {
  return { "x-user-id": String(id), "x-role": role };
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  getFeed: (courseId: number, auth: AuthHeaders, offset = 0): Promise<PostsPage<Post>> =>
    fetch(`/api/courses/${courseId}/feed?offset=${offset}`, { headers: authHeaders(auth) }).then(
      (res) => parseOrThrow<PostsPage<Post>>(res),
    ),

  getSaved: (auth: AuthHeaders, offset = 0): Promise<PostsPage<SavedPost>> =>
    fetch(`/api/saved?offset=${offset}`, { headers: authHeaders(auth) }).then((res) =>
      parseOrThrow<PostsPage<SavedPost>>(res),
    ),

  savePost: (
    postId: number,
    auth: AuthHeaders,
  ): Promise<{ hasSaved: boolean; savesCount: number }> =>
    fetch(`/api/posts/${postId}/save`, { method: "POST", headers: authHeaders(auth) }).then(
      (res) => parseOrThrow<{ hasSaved: boolean; savesCount: number }>(res),
    ),

  unsavePost: (
    postId: number,
    auth: AuthHeaders,
  ): Promise<{ hasSaved: boolean; savesCount: number }> =>
    fetch(`/api/posts/${postId}/unsave`, { method: "POST", headers: authHeaders(auth) }).then(
      (res) => parseOrThrow<{ hasSaved: boolean; savesCount: number }>(res),
    ),

  getUsers: (): Promise<{ users: { id: number; name: string; role: Role }[] }> =>
    fetch(`/api/users`).then((res) =>
      parseOrThrow<{ users: { id: number; name: string; role: Role }[] }>(res),
    ),

  getCourses: (auth: AuthHeaders): Promise<{ courses: Course[] }> =>
    fetch(`/api/courses`, { headers: authHeaders(auth) }).then((res) =>
      parseOrThrow<{ courses: Course[] }>(res),
    ),

  removePost: async (postId: number, auth: AuthHeaders): Promise<void> => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: authHeaders(auth),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error ?? `Request failed with status ${res.status}`);
    }
  },
};
