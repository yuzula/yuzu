import 'react-native-reanimated'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { FunctionComponent, memo, useCallback } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Sentry from 'sentry-expo'

import { AuthContextProvider } from './contexts/AuthContext'
import { ProfileContextProvider } from './contexts/ProfileContext'
import { useAuthContext } from './hooks/useAuthContext'
import { useFonts } from './hooks/useFonts'
import { useProfileContext } from './hooks/useProfileContext'
import { useTrackingTransparency } from './hooks/useTrackingTransparency'
import { Navigation } from './navigation'

Sentry.init({
  dsn: 'https://ed72494c4256c5d19e3994d2d69e93e2@o4506121746186240.ingest.sentry.io/4506121763160064',
  enableInExpoDevelopment: false,
  environment: __DEV__ ? 'development' : 'production'
})

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

const BaseApp: FunctionComponent = memo(() => {
  const { isLoading: areFontsLoading, error: fontsError } = useFonts()

  const { isLoading: isAuthLoading, error: authError } = useAuthContext()

  const { isLoading: isProfileLoading, error: profileError } =
    useProfileContext()

  useTrackingTransparency()

  const handleNavigationReady = useCallback(() => {
    SplashScreen.hideAsync()
  }, [])

  const areResourcesLoading =
    areFontsLoading || isAuthLoading || isProfileLoading

  const areResourcesErroring = fontsError || authError || profileError

  if (areResourcesLoading || areResourcesErroring) {
    return null
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar />
        <Navigation onReady={handleNavigationReady} />
      </GestureHandlerRootView>
    )
  }
})

const App: FunctionComponent = () => (
  <QueryClientProvider client={queryClient}>
    <ActionSheetProvider>
      <AuthContextProvider>
        <ProfileContextProvider>
          <BaseApp />
        </ProfileContextProvider>
      </AuthContextProvider>
    </ActionSheetProvider>
  </QueryClientProvider>
)

// eslint-disable-next-line import/no-default-export
export default App
