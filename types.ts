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

interface CommentScreenParams {
  postId: number
  commentId: number
}

interface ForeignCommunityScreenParams {
  domainName: string
}

interface CreatePostScreenParams {
  initialIsPrivate?: boolean
  isVisibilityChangeable?: boolean
  communityDomainName: string
}

interface CreateCommentScreenParams {
  postId: number
  postAuthorUsername?: string
  postContent?: string
  postCreatedAtTs: number
}

export type RootStackParamList = {
  Root: undefined
  Register: undefined
  Login: undefined
  EmailVerification: EmailVerificationScreenParams
  Post: PostScreenParams
  Comment: CommentScreenParams
  ForeignCommunity: ForeignCommunityScreenParams
  Tabs: NavigatorScreenParams<RootTabParamList> | undefined
  CreatePost: CreatePostScreenParams
  CreateComment: CreateCommentScreenParams
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
