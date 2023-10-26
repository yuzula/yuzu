import { FontAwesome5 } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FunctionComponent } from 'react'

import useAuth from '../hooks/useAuth'
import EmailVerification from '../screens/EmailVerification'
import Home from '../screens/Home'
import Login from '../screens/Login'
import Me from '../screens/Me'
import Post from '../screens/Post'
import Register from '../screens/Register'
import Root from '../screens/Root'
import { RootStackParamList, RootTabParamList } from '../types'
import linking from './linking'

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
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="home" size={20} />
          )
        }}
      />
      <BottomTab.Screen
        component={Me}
        name="Me"
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="user" size={20} />
          )
        }}
      />
    </BottomTab.Navigator>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator: FunctionComponent = () => {
  const { session } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen component={BottomTabNavigator} name="Tabs" />
          <Stack.Screen component={Post} name="Post" />
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

interface NavigationProps {
  onReady?: () => void
}

const Navigation: FunctionComponent<NavigationProps> = ({ onReady }) => (
  <NavigationContainer linking={linking} onReady={onReady}>
    <RootNavigator />
  </NavigationContainer>
)

export default Navigation
