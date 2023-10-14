import { useRouter } from 'expo-router'
import React, { FunctionComponent, useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'

const NotFound: FunctionComponent = () => {
  const router = useRouter()

  const handleHomeButtonPress = useCallback(() => {
    router.push('/')
  }, [router])

  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-4/6 items-center justify-center space-y-6">
        <Text className="text-center font-Poppins_700Bold text-xl">
          You ain&apos;t supposed to be here!
        </Text>
        <Text className="text-center font-Poppins_400Regular text-lg">
          You&apos;ve somehow landed on a screen that shouldn&apos;t exist
        </Text>
        <Pressable
          className="w-full items-center rounded-xl bg-blue-600 p-3.5 active:opacity-90"
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

export default NotFound
