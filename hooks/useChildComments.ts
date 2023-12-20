import { useInfiniteQuery } from '@tanstack/react-query'

import { commentService } from '../services/comment'

interface UseChildCommentsParams {
  commentId: number
}

export const useChildComments = ({ commentId }: UseChildCommentsParams) =>
  useInfiniteQuery({
    queryKey: ['comments', 'comment', commentId],
    queryFn: ({ pageParam }) =>
      commentService.getAllChildren({
        commentId,
        fetchedIds: pageParam
      }),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNextPage
        ? [...lastPageParam, ...lastPage.comments.map(comment => comment.id)]
        : undefined,
    initialPageParam: [] as number[]
  })
