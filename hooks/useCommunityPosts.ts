import { createInfiniteQuery } from 'react-query-kit'

import { postModel } from '../models/post'
import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

type Response = postModel.Schema[]

interface Variables {
  communityDomainName: string
  sortBy: SortBy
  filterBy: FilterBy
}

type PageParams = number[]

export const useCommunityPosts = createInfiniteQuery<
  Response,
  Variables,
  Error,
  PageParams
>({
  queryKey: ['posts', 'community'],
  fetcher: (variables, { pageParam }) =>
    postService.getAll({
      communityDomainName: variables.communityDomainName,
      sortBy: variables.sortBy,
      filterBy: variables.filterBy,
      fetchedIds: pageParam
    }),
  getNextPageParam: (lastPage, _, lastPageParam) =>
    lastPage.length > 0
      ? [...lastPageParam, ...lastPage.map(post => post.id)]
      : undefined,
  initialPageParam: []
})
