import React, { FunctionComponent } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home: FunctionComponent = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text>Home</Text>
    </SafeAreaView>
  )
}

export default Home
