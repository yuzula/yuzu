import React, { FunctionComponent } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Community as CommunityComponent } from '../components/Community'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { RootTabScreenProps } from '../types'

export const Community: FunctionComponent<
  RootTabScreenProps<'Community'>
> = () => {
  const insets = useSafeAreaInsets()

  const { profile } = useAuthenticatedProfile()

  if (!profile) {
    return null
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <CommunityComponent domainName={profile.community_domain_name} />
    </View>
  )
}
