import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { FunctionComponent, memo, useCallback } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Sentry from 'sentry-expo'

import AuthContextProvider from './contexts/AuthContext'
import ProfileContextProvider from './contexts/ProfileContext'
import useFonts from './hooks/useFonts'
import useProfile from './hooks/useProfile'
import useSession from './hooks/useSession'
import useTrackingTransparency from './hooks/useTrackingTransparency'
import Navigation from './navigation'

Sentry.init({
  dsn: 'https://ed72494c4256c5d19e3994d2d69e93e2@o4506121746186240.ingest.sentry.io/4506121763160064',
  enableInExpoDevelopment: true
})

SplashScreen.preventAutoHideAsync()

const App: FunctionComponent = memo(() => {
  const { isLoading: areFontsLoading, error: fontsError } = useFonts()

  const {
    session,
    isLoading: isSessionLoading,
    error: sessionError
  } = useSession()

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError
  } = useProfile(session?.user)

  useTrackingTransparency()

  const areResourcesLoading =
    areFontsLoading || isSessionLoading || isProfileLoading
  const areResourcesErroring = fontsError || sessionError || profileError

  const handleNavigationReady = useCallback(() => {
    if (!areResourcesLoading && !areResourcesErroring) {
      SplashScreen.hideAsync()
    }
  }, [areResourcesErroring, areResourcesLoading])

  if (areResourcesLoading || areResourcesErroring) {
    return null
  } else {
    return (
      <AuthContextProvider session={session ?? undefined}>
        <ProfileContextProvider profile={profile}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar />
            <BottomSheetModalProvider>
              <ActionSheetProvider>
                <Navigation onReady={handleNavigationReady} />
              </ActionSheetProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ProfileContextProvider>
      </AuthContextProvider>
    )
  }
})

export default App
