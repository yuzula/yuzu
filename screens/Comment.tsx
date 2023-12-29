import React, { FunctionComponent } from 'react'
import { Text } from 'react-native'

import { RootStackScreenProps } from '../types'

export const Comment: FunctionComponent<
  RootStackScreenProps<'Comment'>
> = () => {
  return <Text>Comment</Text>
}
