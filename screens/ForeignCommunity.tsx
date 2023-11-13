import React, { FunctionComponent, useCallback } from 'react'

import { Community as CommunityComponent } from '../components/Community'
import { RootStackScreenProps } from '../types'

export const ForeignCommunity: FunctionComponent<
  RootStackScreenProps<'ForeignCommunity'>
> = ({
  navigation,
  route: {
    params: { domainName }
  }
}) => {
  const handleCreatePostButtonPress = useCallback(
    (initialIsPrivate: boolean) => {
      navigation.navigate('CreatePost', {
        initialIsPrivate,
        communityDomainName: domainName
      })
    },
    [domainName, navigation]
  )

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  return (
    <CommunityComponent
      isForeign
      domainName={domainName}
      onCreatePostButtonPress={handleCreatePostButtonPress}
      onPostPress={handlePostPress}
    />
  )
}
