import React, { FunctionComponent, useCallback } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import BackButton from '../components/BackButton'
import { RootStackScreenProps } from '../types'

const Login: FunctionComponent<RootStackScreenProps<'Login'>> = ({
  navigation
}) => {
  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [navigation])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <BackButton onPress={handleBackButtonPress} />
      <View className="w-4/6 items-center justify-center space-y-8">
        <View className="w-full space-y-4">
          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
              Username or email
            </Text>
            <TextInput className="h-10 w-full border-b border-apple-gray-light" />
          </View>

          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
              Password
            </Text>
            <TextInput className="h-10 w-full border-b border-apple-gray-light" />
          </View>
        </View>

        <Pressable className="w-full items-center justify-center rounded-xl bg-apple-blue-light p-3.5 active:opacity-90">
          <Text className="font-Poppins_600SemiBold text-white">Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Login
