import { FontAwesome5 } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FunctionComponent } from 'react'

import { useAuthContext } from '../hooks/useAuthContext'
import { useProfileContext } from '../hooks/useProfileContext'
import { Comment } from '../screens/Comment'
import { Community } from '../screens/Community'
import { CreateComment } from '../screens/CreateComment'
import { CreatePost } from '../screens/CreatePost'
import { EmailVerification } from '../screens/EmailVerification'
import { ForeignCommunity } from '../screens/ForeignCommunity'
import { Home } from '../screens/Home'
import { Login } from '../screens/Login'
import { Me } from '../screens/Me'
import { NotFound } from '../screens/NotFound'
import { Post } from '../screens/Post'
import { Register } from '../screens/Register'
import { Root } from '../screens/Root'
import { Search } from '../screens/Search'
import { RootStackParamList, RootTabParamList } from '../types'
import { linking } from './linking'

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
        component={Community}
        name="Community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="users" size={20} />
          )
        }}
      />
      <BottomTab.Screen
        component={Search}
        name="Search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="search" size={20} />
          )
        }}
      />
      <BottomTab.Screen
        component={Me}
        name="Me"
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 color={color} name="user-alt" size={20} />
          )
        }}
      />
    </BottomTab.Navigator>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator: FunctionComponent = () => {
  const { session } = useAuthContext()
  const { profile } = useProfileContext()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && profile ? (
        <>
          <Stack.Screen component={BottomTabNavigator} name="Tabs" />
          <Stack.Screen component={ForeignCommunity} name="ForeignCommunity" />
          <Stack.Screen component={Post} name="Post" />
          <Stack.Screen component={Comment} name="Comment" />
          <Stack.Screen
            component={CreatePost}
            name="CreatePost"
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            component={CreateComment}
            name="CreateComment"
            options={{ presentation: 'fullScreenModal' }}
          />
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
          <Stack.Screen component={NotFound} name="NotFound" />
        </>
      )}
    </Stack.Navigator>
  )
}

interface NavigationProps {
  onReady?: () => void
}

export const Navigation: FunctionComponent<NavigationProps> = ({ onReady }) => (
  <NavigationContainer linking={linking} onReady={onReady}>
    <RootNavigator />
  </NavigationContainer>
)
