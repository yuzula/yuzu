import React, { FunctionComponent, useCallback } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      Sentry.Native.captureException('Could not go back')

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    }
  }, [navigation])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <CommunityComponent
        isForeign
        domainName={domainName}
        onBackButtonPress={handleBackButtonPress}
      />
    </SafeAreaView>
  )
}
