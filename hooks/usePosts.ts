import { createInfiniteQuery } from 'react-query-kit'

import { postModel } from '../models/post'
import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

interface Data {
  posts: postModel.Schema[]
  hasNextPage: boolean
}

interface Variables {
  sortBy: SortBy
  filterBy: FilterBy
}

type PageParams = number[]

export const usePosts = createInfiniteQuery<Data, Variables, Error, PageParams>(
  {
    queryKey: ['posts'],
    fetcher: (variables, { pageParam }) =>
      postService.getAll({
        sortBy: variables.sortBy,
        filterBy: variables.filterBy,
        fetchedIds: pageParam
      }),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNextPage
        ? [...lastPageParam, ...lastPage.posts.map(post => post.id)]
        : undefined,
    initialPageParam: []
  }
)
