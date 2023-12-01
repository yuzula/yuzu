import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'

interface UseCommunityPostsParams {
  domainName: string
}

export const useCommunityPosts = ({ domainName }: UseCommunityPostsParams) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const [sortBy, setSortBy] = useState<SortBy>('hot')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: [
      'posts',
      'community',
      domainName,
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
    if (!isFetching) {
      setIsInitialLoading(false)
    }
  }, [isFetching])

  // We need to use a separate state to track refreshing since using `isFetching` or
  // or `isRefetching` causes weird jumpy behavior in Flatlist's pull to refresh
  //
  // TODO: investigate why this happens
  //
  // https://github.com/TanStack/query/issues/2380
  // https://github.com/facebook/react-native/issues/32836
  const refresh = useCallback(async () => {
    setIsRefreshing(true)

    await refetch()

    setIsRefreshing(false)
  }, [refetch])

  return {
    posts: data,
    error,
    isInitialLoading,
    sortBy,
    filterBy,
    setSortBy,
    setFilterBy,
    refresh,
    isRefreshing: isRefreshing || isFetching
  }
}
