import { createQuery } from 'react-query-kit'

import { postModel } from '../models/post'
import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

type Response = postModel.Schema[]

interface Variables {
  sortBy: SortBy
  filterBy: FilterBy
}

export const usePosts = createQuery<Response, Variables, Error>({
  queryKey: ['posts'],
  fetcher: variables =>
    postService.getAll({
      sortBy: variables.sortBy,
      filterBy: variables.filterBy
    })
})
