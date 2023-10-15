import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { FunctionComponent, memo, useEffect } from 'react'

import useFonts from './hooks/useFonts'
import useSession from './hooks/useSession'
import Navigation from './navigation'

SplashScreen.preventAutoHideAsync()

const App: FunctionComponent = memo(() => {
  const { isLoading: areFontsLoading, error: fontsError } = useFonts()
  const { isLoading: isSessionLoading, error: sessionError } = useSession()

  const areResourcesLoading = areFontsLoading || isSessionLoading
  const areResourcesErroring = fontsError || sessionError

  useEffect(() => {
    if (!areResourcesLoading && !areResourcesErroring) {
      SplashScreen.hideAsync()
    }
  }, [areResourcesErroring, areResourcesLoading])

  if (areResourcesLoading || areResourcesErroring) {
    return null
  } else {
    return (
      <>
        <StatusBar />
        <Navigation />
      </>
    )
  }
})

export default App
