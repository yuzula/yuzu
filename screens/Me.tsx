import React, { FunctionComponent } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'

const Me: FunctionComponent = () => (
  <SafeAreaView className="flex-1 bg-white">
    <Button
      onPress={() => {
        supabase.auth.signOut()
      }}
    >
      Log Out
    </Button>
  </SafeAreaView>
)

export default Me
