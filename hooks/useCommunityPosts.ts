import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

interface UseCommunityPostsParams {
  domainName: string
}

export const useCommunityPosts = ({ domainName }: UseCommunityPostsParams) => {
  const [isLoadingInitially, setIsLoadingInitially] = useState(true)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const [sortBy, setSortBy] = useState<SortBy>('hot')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: [
      'communities',
      domainName,
      'posts',
      {
        sortBy,
        filterBy
      }
    ],
    queryFn: () =>
      postService.getAll({ communityDomainName: domainName, sortBy, filterBy }),
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (isFetching) {
      setIsLoadingInitially(false)
    }
  }, [isFetching])

  const sort = useCallback((sortBy: SortBy) => {
    setSortBy(sortBy)
  }, [])

  const filter = useCallback((filterBy: FilterBy) => {
    setFilterBy(filterBy)
  }, [])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)

    await refetch()

    setIsRefreshing(false)
  }, [refetch])

  return {
    posts: data,
    error,
    isLoadingInitially,
    isFetching,
    sortBy,
    filterBy,
    sort,
    filter,
    refresh,
    isRefreshing
  }
}
