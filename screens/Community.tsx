import React, { FunctionComponent, useCallback } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Community as CommunityComponent } from '../components/Community'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { RootTabScreenProps } from '../types'

export const Community: FunctionComponent<RootTabScreenProps<'Community'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets()

  const { profile } = useAuthenticatedProfile()

  const handleCreatePostButtonPress = useCallback(
    (initialIsPrivate: boolean) =>
      navigation.navigate('CreatePost', {
        initialIsPrivate,
        communityDomainName: profile.community_domain_name
      }),
    [navigation, profile]
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
      />
    </View>
  )
}
