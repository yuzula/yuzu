import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'

interface UseRouteGuardParams {
  isAuthenticated: boolean
}

const useRouteGuard = ({ isAuthenticated }: UseRouteGuardParams) => {
  const segments = useSegments()

  const router = useRouter()

  useEffect(() => {
    const isRouteProtected = segments[0] === '(protected)'

    if (!isAuthenticated && isRouteProtected) {
      router.replace('/')
    } else if (isAuthenticated && !isRouteProtected) {
      router.replace('/explore')
    }
  }, [isAuthenticated, router, segments])
}

export default useRouteGuard
