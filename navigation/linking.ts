/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native'
import * as Linking from 'expo-linking'

import { RootStackParamList } from '../types'

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'https://yuzu.la'],
  config: {
    screens: {
      Root: 'root',
      Login: 'login',
      Register: 'register',
      Post: 'post',
      CreatePost: 'createPost',
      CreatePostComment: 'createPostComment',
      Tabs: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'home'
            }
          },
          Community: {
            screens: {
              CommunityScreen: 'community'
            }
          },
          Search: {
            screens: {
              SearchScreen: 'search'
            }
          },
          Me: {
            screens: {
              MeScreen: 'me'
            }
          }
        }
      },
      NotFound: '*'
    }
  }
}
