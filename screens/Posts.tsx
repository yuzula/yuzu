import React, { FunctionComponent } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RootTabScreenProps } from '../types'

export const Posts: FunctionComponent<RootTabScreenProps<'Posts'>> = () => {
  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <Text>Posts</Text>
    </SafeAreaView>
  )
}
