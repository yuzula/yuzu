import { FontAwesome5 } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as Haptics from 'expo-haptics'
import React, { FunctionComponent } from 'react'
import { useBoolean } from 'usehooks-ts'

import { Community } from '../../screens/Community'
import { Home } from '../../screens/Home'
import { Me } from '../../screens/Me'
import { Search } from '../../screens/Search'
import { RootTabParamList } from '../types'

const BottomTab = createBottomTabNavigator<RootTabParamList>()

export const BottomTabNavigator: FunctionComponent = () => {
  const {
    value: isInitialStateChange,
    setFalse: setIsInitialStateChangeFalse
  } = useBoolean(true)

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenListeners={{
        state: async () => {
          if (!isInitialStateChange) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }

          setIsInitialStateChangeFalse()
        }
      }}
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
