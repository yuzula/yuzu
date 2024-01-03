import { useInfiniteQuery } from '@tanstack/react-query'

import { communityService } from '../services/community'

interface UseSearchCommunitiesParams {
  query: string
}

export const useSearchCommunities = ({ query }: UseSearchCommunitiesParams) =>
  useInfiniteQuery({
    queryKey: ['communities', { query }],
    queryFn: ({ pageParam }) =>
      communityService.search({ query, fetchedDomainNames: pageParam }),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNextPage
        ? [
            ...lastPageParam,
            ...lastPage.communities.map(community => community.domain_name)
          ]
        : undefined,
    initialPageParam: [] as string[]
  })
