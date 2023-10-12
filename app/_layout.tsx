import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { FunctionComponent, useEffect } from 'react'
import { TamaguiProvider } from 'tamagui'

import config from '../tamagui.config'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

const Layout: FunctionComponent = () => {
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
  })

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  )
}

export default Layout
