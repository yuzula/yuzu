import { FunctionComponent } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Logo from '../components/Logo'

const Index: FunctionComponent = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center">
        <Logo height={50} width={50} />

        <Text>Open up App.js to start working on your app!</Text>
      </View>
    </SafeAreaView>
  )
}

export default Index
