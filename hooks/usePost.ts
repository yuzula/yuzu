import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { postService } from '../services/post'

export const usePost = (id: number) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.get(id),
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
    post: data,
    error,
    isInitialLoading,
    refresh,
    isRefreshing: isRefreshing || isFetching
  }
}
