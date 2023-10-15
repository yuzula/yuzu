import { useRootNavigationState, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'

interface UseRouteGuardParams {
  isAuthenticated: boolean
}

const useRouteGuard = ({ isAuthenticated }: UseRouteGuardParams) => {
  const router = useRouter()
  const segments = useSegments()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    if (!navigationState?.key) {
      return
    }

    const isRouteProtected = segments[0] === '(protected)'

    if (!isAuthenticated && isRouteProtected) {
      router.replace('/')
    } else if (isAuthenticated && !isRouteProtected) {
      router.replace('/home')
    }
  }, [isAuthenticated, router, navigationState?.key, segments])
}

export default useRouteGuard
