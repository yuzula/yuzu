import React, { FunctionComponent, useCallback } from 'react'
import { Alert, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Community as CommunityComponent } from '../components/Community'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { useProfileContext } from '../hooks/useProfileContext'
import { RootTabScreenProps } from '../types'

export const Community: FunctionComponent<RootTabScreenProps<'Community'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets()

  const { profile } = useProfileContext()

  const handleCreatePostButtonPress = useCallback(
    (initialIsPrivate: boolean) => {
      if (!profile) {
        Sentry.Native.captureException('Profile is not defined')

        return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }

      navigation.navigate('CreatePost', {
        initialIsPrivate,
        communityDomainName: profile.community_domain_name
      })
    },
    [navigation, profile]
  )

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  if (!profile) {
    return null
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <CommunityComponent
        domainName={profile.community_domain_name}
        onCreatePostButtonPress={handleCreatePostButtonPress}
        onPostPress={handlePostPress}
      />
    </View>
  )
}
