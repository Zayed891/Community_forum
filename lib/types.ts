export type Role = "student" | "moderator";

export type Post = {
  id: number;
  courseId: number;
  authorId: number;
  title: string;
  body: string;
  createdAt: string;
  hasSaved: boolean;
  savesCount: number;
};

export type SavedPost = Post & { savedAt: string };

export type PostsPage<T> = {
  posts: T[];
  limit: number;
  offset: number;
};

export type Course = { id: number; name: string };
