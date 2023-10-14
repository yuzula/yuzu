import React, { FunctionComponent } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Login: FunctionComponent = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="w-4/6 items-center justify-center space-y-8">
        <View className="w-full space-y-4">
          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-gray-400">
              Username or email
            </Text>
            <TextInput className="h-10 w-full border-b border-gray-400" />
          </View>

          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-gray-400">
              Password
            </Text>
            <TextInput className="h-10 w-full border-b border-gray-400" />
          </View>
        </View>

        <Pressable className="w-full items-center justify-center rounded-xl bg-blue-600 p-3.5 active:opacity-90">
          <Text className="font-Poppins_600SemiBold text-white">Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Login
