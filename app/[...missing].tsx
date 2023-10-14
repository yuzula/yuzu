import { useRouter } from 'expo-router'
import React, { FunctionComponent, useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'

const NotFound: FunctionComponent = () => {
  const router = useRouter()

  const handleHomeButtonPress = useCallback(() => {
    router.push('/')
  }, [router])

  return (
    <View className="w-5/6 flex-1 items-center justify-center space-y-2">
      <Text className="font-Poppins_700Bold text-xl">
        You ain&apos;t supposed to be here!
      </Text>
      <Text className="font-Poppins_400Regular text-lg">
        You&apos;ve somehow landed on a screen that shouldn&apos;t exist
      </Text>
      <Pressable className="active:opacity-90" onPress={handleHomeButtonPress}>
        <View className="rounded-lg bg-blue-600 p-4">
          <Text className="font-Poppins_600SemiBold text-white">
            Take me home
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

export default NotFound
