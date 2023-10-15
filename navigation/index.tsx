import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { ComponentProps, FunctionComponent } from 'react'

import useSession from '../hooks/useSession'
import EmailVerification from '../screens/EmailVerification'
import Home from '../screens/home'
import Login from '../screens/Login'
import Profile from '../screens/profile'
import Register from '../screens/Register'
import Root from '../screens/Root'
import { RootStackParamList, RootTabParamList } from '../types'
import linking from './linking'

interface TabBarIconProps {
  name: ComponentProps<typeof MaterialIcons>['name']
  color: string
}

const TabBarIcon: FunctionComponent<TabBarIconProps> = ({ ...rest }) => (
  <MaterialIcons {...rest} size={25} />
)

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
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="search" />
        }}
      />
      <BottomTab.Screen
        component={Profile}
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabBarIcon color={color} name="ev-station" />
          )
        }}
      />
    </BottomTab.Navigator>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator: FunctionComponent = () => {
  const { session } = useSession()

  return (
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
  )
}

const Navigation: FunctionComponent = () => (
  <NavigationContainer linking={linking}>
    <RootNavigator />
  </NavigationContainer>
)

export default Navigation
