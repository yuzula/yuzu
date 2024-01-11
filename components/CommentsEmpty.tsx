import React, { FunctionComponent, memo } from 'react'
import { Text, View } from 'react-native'

export const CommentsEmpty: FunctionComponent = memo(() => (
  <View className="flex-1 items-center justify-center">
    <Text className="font-Poppins_600SemiBold text-base text-gray-light">
      No comments yet
    </Text>
    <Text className="font-Poppins_500Medium text-gray-light">
      Be the first to comment!
    </Text>
  </View>
))
