import { useInfiniteQuery } from '@tanstack/react-query'

import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

interface UsePostsParams {
  sortBy: SortBy
  filterBy: FilterBy
}

export const usePosts = ({ sortBy, filterBy }: UsePostsParams) =>
  useInfiniteQuery({
    queryKey: ['posts', { sortBy, filterBy }],
    queryFn: ({ pageParam }) =>
      postService.getAll({
        sortBy,
        filterBy,
        fetchedIds: pageParam
      }),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNextPage
        ? [...lastPageParam, ...lastPage.posts.map(post => post.id)]
        : undefined,
    initialPageParam: [] as number[]
  })
