import { useInfiniteQuery } from '@tanstack/react-query'

import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

interface UseCommunityPostsParams {
  communityDomainName: string
  sortBy: SortBy
  filterBy: FilterBy
}

export const useCommunityPosts = ({
  communityDomainName,
  sortBy,
  filterBy
}: UseCommunityPostsParams) =>
  useInfiniteQuery({
    queryKey: ['posts', 'community', communityDomainName, { sortBy, filterBy }],
    queryFn: ({ pageParam }) =>
      postService.getAll({
        communityDomainName,
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
