import React, { FunctionComponent, useCallback } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { Community as CommunityComponent } from '../components/Community'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { RootStackScreenProps } from '../types'

export const ForeignCommunity: FunctionComponent<
  RootStackScreenProps<'ForeignCommunity'>
> = ({
  navigation,
  route: {
    params: { domainName }
  }
}) => {
  const handleCreatePostButtonPress = useCallback(() => {
    navigation.navigate('CreatePost', {
      initialIsPrivate: false,
      isVisibilityChangeable: false,
      communityDomainName: domainName
    })
  }, [domainName, navigation])

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      Sentry.Native.captureException('Could not go back')

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    }
  }, [navigation])

  return (
    <CommunityComponent
      isForeign
      domainName={domainName}
      onBackButtonPress={handleBackButtonPress}
      onCreatePostButtonPress={handleCreatePostButtonPress}
      onPostPress={handlePostPress}
    />
  )
}
