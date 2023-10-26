import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { FunctionComponent, memo, useCallback } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import AuthContextProvider from './contexts/AuthContext'
import useFonts from './hooks/useFonts'
import useSession from './hooks/useSession'
import Navigation from './navigation'

SplashScreen.preventAutoHideAsync()

const App: FunctionComponent = memo(() => {
  const { isLoading: areFontsLoading, error: fontsError } = useFonts()
  const {
    session,
    isLoading: isSessionLoading,
    error: sessionError
  } = useSession()

  const areResourcesLoading = areFontsLoading || isSessionLoading
  const areResourcesErroring = fontsError || sessionError

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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar />
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <Navigation onReady={handleNavigationReady} />
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </AuthContextProvider>
    )
  }
})

export default App
