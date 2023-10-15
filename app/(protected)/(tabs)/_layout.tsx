import { FontAwesome5 } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { FunctionComponent } from 'react'

const Layout: FunctionComponent = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: 'rgb(0, 122, 255)',
      tabBarInactiveTintColor: 'rgb(142, 142, 147)'
    }}
  >
    <Tabs.Screen
      name="home"
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => (
          <FontAwesome5 color={color} name="home" size={20} />
        )
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => (
          <FontAwesome5 color={color} name="user-alt" size={20} />
        )
      }}
    />
  </Tabs>
)

export default Layout
