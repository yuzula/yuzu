import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { FunctionComponent } from 'react'

import { useAuthContext } from '../../hooks/useAuthContext'
import { useProfileContext } from '../../hooks/useProfileContext'
import { Comment } from '../../screens/Comment'
import { CreateComment } from '../../screens/CreateComment'
import { CreatePost } from '../../screens/CreatePost'
import { EmailVerification } from '../../screens/EmailVerification'
import { ForeignCommunity } from '../../screens/ForeignCommunity'
import { Login } from '../../screens/Login'
import { NotFound } from '../../screens/NotFound'
import { Post } from '../../screens/Post'
import { Register } from '../../screens/Register'
import { Root } from '../../screens/Root'
import { RootStackParamList } from '../types'
import { BottomTabNavigator } from './BottomTab'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const RootNavigator: FunctionComponent = () => {
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
