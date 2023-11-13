/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams
} from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

interface EmailVerificationScreenParams {
  email: string
}

interface PostScreenParams {
  postId: number
}

interface ForeignCommunityScreenParams {
  domainName: string
}

interface CreatePostScreenParams {
  initialIsPrivate?: boolean
  communityDomainName: string
}

export type RootStackParamList = {
  Root: undefined
  Register: undefined
  Login: undefined
  EmailVerification: EmailVerificationScreenParams
  Post: PostScreenParams
  ForeignCommunity: ForeignCommunityScreenParams
  Tabs: NavigatorScreenParams<RootTabParamList> | undefined
  CreatePost: CreatePostScreenParams
  NotFound: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>

export type RootTabParamList = {
  Home: undefined
  Community: undefined
  Search: undefined
  Me: undefined
}

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >
