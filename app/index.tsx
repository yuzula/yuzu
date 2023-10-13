import { FunctionComponent } from 'react'
import { Text, TouchableHighlight, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Logo from '../components/Logo'

const Index: FunctionComponent = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <SafeAreaView className="flex-1 bg-indigo-500" edges={['bottom']}>
        <View className="flex-1 basis-2 items-center justify-between bg-primary">
          <View className="grow items-center justify-center">
            <Logo height={120} width={120} />
          </View>

          <View className="w-full grow justify-end">
            <TouchableHighlight>
              <View className="h-20 items-center justify-center bg-blue-500">
                <Text className="font-Poppins_600SemiBold text-xl text-white">
                  LOG IN
                </Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight>
              <View className="h-20 items-center justify-center bg-indigo-500">
                <Text className="font-Poppins_600SemiBold text-xl text-white">
                  SIGN UP
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  )
}

export default Index
