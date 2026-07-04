export const queryKeys = {
  feed: (courseId: number) => ["posts", "feed", courseId] as const,
  saved: (userId: number) => ["posts", "saved", userId] as const,
  users: () => ["users"] as const,
  courses: (userId: number) => ["courses", userId] as const,
};
