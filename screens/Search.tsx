import { FunctionComponent } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RootTabScreenProps } from '../types'

export const Search: FunctionComponent<RootTabScreenProps<'Search'>> = () => {
  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <Text>Search</Text>
    </SafeAreaView>
  )
}
