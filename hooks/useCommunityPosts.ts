import { createQuery } from 'react-query-kit'

import { postModel } from '../models/post'
import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

type Response = postModel.Schema[]

interface Variables {
  communityDomainName: string
  sortBy: SortBy
  filterBy: FilterBy
}

export const useCommunityPosts = createQuery<Response, Variables, Error>({
  queryKey: ['posts', 'community'],
  fetcher: variables =>
    postService.getAll({
      communityDomainName: variables.communityDomainName,
      sortBy: variables.sortBy,
      filterBy: variables.filterBy
    })
})
