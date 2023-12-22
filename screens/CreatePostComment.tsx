import React, { FunctionComponent } from 'react'
import { Text, View } from 'react-native'

import { RootStackScreenProps } from '../types'

export const CreatePostComment: FunctionComponent<
  RootStackScreenProps<'CreatePostComment'>
> = () => {
  return (
    <View>
      <Text>Create post comment</Text>
    </View>
  )
}
