import React, { FunctionComponent } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'

const Me: FunctionComponent = () => (
  <SafeAreaView className="flex-1 items-center justify-center bg-white">
    <View className="w-5/6">
      <Button
        onPress={() => {
          supabase.auth.signOut()
        }}
      >
        Log Out
      </Button>
    </View>
  </SafeAreaView>
)

export default Me
