import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'

import { RootStackScreenProps } from '../types'

export const NotFound: FunctionComponent<RootStackScreenProps<'NotFound'>> = ({
  navigation
}) => {
  const handleHomeButtonPress = useCallback(() => {
    navigation.navigate('Root')
  }, [navigation])

  useEffect(() => {
    Sentry.Native.captureException(navigation.getState())
  }, [navigation])

  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-4/6 items-center justify-center space-y-6">
        <Text className="text-center font-Poppins_600SemiBold text-xl">
          You ain't supposed to be here!
        </Text>
        <Text className="text-center font-Poppins_500Medium">
          This screen doesn't exist. We've been notified of this issue and will
          look into it.
        </Text>
        <Pressable
          className="w-full items-center rounded-xl bg-blue-light p-3.5 active:opacity-90"
          onPress={handleHomeButtonPress}
        >
          <Text className="font-Poppins_600SemiBold text-white">
            Take me home
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
