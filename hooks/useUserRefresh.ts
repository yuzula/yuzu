import { useCallback, useState } from 'react'

// https://github.com/facebook/react-native/issues/32836
export function useUserRefresh<T>(refetch: () => Promise<T>) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)

    await refetch()

    setIsRefreshing(false)
  }, [refetch])

  return { isRefreshing, refresh }
}
