import React, { FunctionComponent, useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Logo } from '../components/Logo'
import { RootStackScreenProps } from '../navigation/types'

export const Root: FunctionComponent<RootStackScreenProps<'Root'>> = ({
  navigation
}) => {
  const handleLoginButtonPress = useCallback(() => {
    navigation.navigate('Login')
  }, [navigation])

  const handleRegisterButtonPress = useCallback(() => {
    navigation.navigate('Register')
  }, [navigation])

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <SafeAreaView className="flex-1 bg-blue-light" edges={['bottom']}>
        <View className="flex-1 basis-2 items-center justify-between bg-primary">
          <View className="grow items-center justify-center">
            <Logo height={120} width={120} />
          </View>

          <View className="w-full grow justify-end">
            <Pressable
              className="active:opacity-90"
              onPress={handleLoginButtonPress}
            >
              <View className="h-20 items-center justify-center bg-pink-light">
                <Text className="font-Poppins_700Bold text-xl uppercase text-white">
                  Log In
                </Text>
              </View>
            </Pressable>

            <Pressable
              className="active:opacity-90"
              onPress={handleRegisterButtonPress}
            >
              <View className="h-20 items-center justify-center bg-blue-light">
                <Text className="font-Poppins_700Bold text-xl uppercase text-white">
                  Sign Up
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  )
}
