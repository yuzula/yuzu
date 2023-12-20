import { useInfiniteQuery } from '@tanstack/react-query'

import { commentService } from '../services/comment'

interface UseRootCommentsParams {
  postId: number
}

export const useRootComments = ({ postId }: UseRootCommentsParams) =>
  useInfiniteQuery({
    queryKey: ['comments', 'post', postId],
    queryFn: ({ pageParam }) =>
      commentService.getAllRoot({
        postId,
        fetchedIds: pageParam
      }),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNextPage
        ? [...lastPageParam, ...lastPage.comments.map(comment => comment.id)]
        : undefined,
    initialPageParam: [] as number[]
  })
