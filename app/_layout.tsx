import { SplashScreen, Stack } from 'expo-router'
import { FunctionComponent, useEffect } from 'react'
import { TamaguiProvider } from 'tamagui'

import useFonts from '../hooks/useFonts'
import useRouteGuard from '../hooks/useRouteGuard'
import useSession from '../hooks/useSession'
import config from '../tamagui.config'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

const Layout: FunctionComponent = () => {
  const { isLoading: areFontsLoading, error: fontsError } = useFonts()
  const {
    session,
    isLoading: isSessionLoading,
    error: sessionError
  } = useSession()

  useRouteGuard({ isAuthenticated: !!session })

  const areResourcesLoading = areFontsLoading || isSessionLoading
  const areResourcesErroring = fontsError || sessionError

  useEffect(() => {
    if (areResourcesErroring) {
      throw fontsError ?? sessionError
    }
  }, [areResourcesErroring, fontsError, sessionError])

  useEffect(() => {
    if (!areResourcesLoading && !areResourcesErroring) {
      SplashScreen.hideAsync()
    }
  }, [areResourcesErroring, areResourcesLoading])

  return (
    <TamaguiProvider config={config}>
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  )
}

export default Layout
