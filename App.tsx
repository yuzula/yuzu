import { FontAwesome5 } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as SplashScreen from 'expo-splash-screen'
import React, { FunctionComponent, memo, useCallback } from 'react'

import useFonts from './hooks/useFonts'
import useSession from './hooks/useSession'
import linking from './navigation/linking'
import EmailVerification from './screens/EmailVerification'
import Home from './screens/home'
import Login from './screens/Login'
import Profile from './screens/profile'
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
        tabBarActiveTintColor: 'rgb(0, 122, 255)',
        tabBarInactiveTintColor: 'rgb(142, 142, 147)',
        tabBarStyle: {
          backgroundColor: 'white'
        }
      }}
    >
      <BottomTab.Screen
        component={Home}
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="home" size={20} />
          )
        }}
      />
      <BottomTab.Screen
        component={Profile}
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="user-alt" size={20} />
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
      <NavigationContainer linking={linking} onReady={handleNavigationReady}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen component={BottomTabNavigator} name="Tabs" />
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
    )
  }
})

export default App
