import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import clsx from 'clsx'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { FunctionComponent, memo, useCallback } from 'react'
import { Text } from 'react-native'

import useFonts from './hooks/useFonts'
import useSession from './hooks/useSession'
import linking from './navigation/linking'
import CreatePost from './screens/CreatePost'
import EmailVerification from './screens/EmailVerification'
import Home from './screens/Home'
import Login from './screens/Login'
import Me from './screens/Me'
import Register from './screens/Register'
import Root from './screens/Root'
import { RootStackParamList, RootTabParamList } from './types'

SplashScreen.preventAutoHideAsync()

const BottomTab = createBottomTabNavigator<RootTabParamList>()

const BottomTabNavigator: FunctionComponent = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'rgb(142, 142, 147)',
        tabBarStyle: {
          backgroundColor: 'white'
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins_600SemiBold'
        }
      }}
    >
      <BottomTab.Screen
        component={Home}
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text
              className={clsx({
                'text-black': focused,
                'text-apple-gray-light': !focused
              })}
            >
              <FontAwesome5 name="home" size={20} />
            </Text>
          )
        }}
      />
      <BottomTab.Screen
        component={Me}
        name="Me"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => (
            <Text
              className={clsx({
                'text-black': focused,
                'text-apple-gray-light': !focused
              })}
            >
              <FontAwesome5 name="user" size={20} />
            </Text>
          )
        }}
      />
    </BottomTab.Navigator>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>()

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
      <>
        <StatusBar />
        <ActionSheetProvider>
          <NavigationContainer
            linking={linking}
            onReady={handleNavigationReady}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {session ? (
                <>
                  <Stack.Screen component={BottomTabNavigator} name="Tabs" />
                  <Stack.Screen component={CreatePost} name="CreatePost" />
                </>
              ) : (
                <>
                  <Stack.Screen component={Root} name="Root" />
                  <Stack.Screen component={Register} name="Register" />
                  <Stack.Screen component={Login} name="Login" />
                  <Stack.Screen
                    component={EmailVerification}
                    name="EmailVerification"
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ActionSheetProvider>
      </>
    )
  }
})

export default App
