/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native'
import * as Linking from 'expo-linking'

import { RootStackParamList } from '../types'

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'https://yuzu.la'],
  config: {
    screens: {
      Root: 'root',
      Login: 'login',
      Register: 'register',
      Post: 'post',
      Tabs: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'home'
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

export default linking
