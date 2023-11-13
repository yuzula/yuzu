import React, { FunctionComponent } from 'react'
import { Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RootTabScreenProps } from '../types'

export const Search: FunctionComponent<RootTabScreenProps<'Search'>> = () => {
  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <View className="w-full items-center justify-center space-y-2 border-b border-gray-100 py-4">
        <TextInput
          autoFocus
          className="mx-auto w-5/6 rounded-xl bg-gray-100 p-2 font-Poppins_600SemiBold"
          placeholder="Search communities"
          returnKeyType="search"
        />
      </View>

      <View className="flex-1 items-center justify-center">
        <Text>body</Text>
      </View>
    </SafeAreaView>
  )
}
