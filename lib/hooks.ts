import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { api } from "./api-client";
import { queryKeys } from "./query-keys";
import { useCurrentUser } from "./current-user-context";
import type { Post, PostsPage, SavedPost } from "./types";

export function useCourses() {
  const { currentUser } = useCurrentUser();

  return useQuery({
    queryKey: currentUser ? queryKeys.courses(currentUser.id) : queryKeys.courses(-1),
    queryFn: () => api.getCourses(currentUser!),
    enabled: !!currentUser,
  });
}

function nextPageParam(lastPage: PostsPage<Post | SavedPost>) {
  return lastPage.posts.length < lastPage.limit ? undefined : lastPage.offset + lastPage.limit;
}

export function useFeed(courseId: number) {
  const { currentUser } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.feed(courseId),
    queryFn: ({ pageParam }) => api.getFeed(courseId, currentUser!, pageParam),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    enabled: !!currentUser,
  });
}

export function useSavedList() {
  const { currentUser } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: currentUser ? queryKeys.saved(currentUser.id) : queryKeys.saved(-1),
    queryFn: ({ pageParam }) => api.getSaved(currentUser!, pageParam),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    enabled: !!currentUser,
  });
}

type ToggleSaveVars = { post: Post | SavedPost; courseId: number };

export function useToggleSave() {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: ({ post }: ToggleSaveVars) =>
      post.hasSaved
        ? api.unsavePost(post.id, currentUser!)
        : api.savePost(post.id, currentUser!),

    onMutate: async ({ post, courseId }: ToggleSaveVars) => {
      const feedKey = queryKeys.feed(courseId);
      const savedKey = queryKeys.saved(currentUser!.id);

      await queryClient.cancelQueries({ queryKey: feedKey });
      await queryClient.cancelQueries({ queryKey: savedKey });

      const previousFeed = queryClient.getQueryData<InfiniteData<PostsPage<Post>>>(feedKey);
      const previousSaved = queryClient.getQueryData<InfiniteData<PostsPage<SavedPost>>>(savedKey);

      const nextHasSaved = !post.hasSaved;
      const nextSavesCount = post.savesCount + (nextHasSaved ? 1 : -1);

      const patchPost = <T extends Post>(p: T): T =>
        p.id === post.id ? { ...p, hasSaved: nextHasSaved, savesCount: nextSavesCount } : p;

      queryClient.setQueryData<InfiniteData<PostsPage<Post>>>(feedKey, (old) =>
        old
          ? { ...old, pages: old.pages.map((page) => ({ ...page, posts: page.posts.map(patchPost) })) }
          : old,
      );

      queryClient.setQueryData<InfiniteData<PostsPage<SavedPost>>>(savedKey, (old) => {
        if (!old) return old;
        if (nextHasSaved) return old; // will show up after refetch, not worth constructing a fake row
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((p) => p.id !== post.id),
          })),
        };
      });

      return { previousFeed, previousSaved, feedKey, savedKey };
    },

    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(context.feedKey, context.previousFeed);
      queryClient.setQueryData(context.savedKey, context.previousSaved);
    },

    onSettled: (_data, _err, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saved(currentUser!.id) });
    },
  });
}

export function useRemovePost(courseId: number) {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: (postId: number) => api.removePost(postId, currentUser!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed(courseId) });
    },
  });
}
