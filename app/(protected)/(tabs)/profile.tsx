import React, { FunctionComponent } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../../../clients/supabase'
import Button from '../../../components/Button'

const Profile: FunctionComponent = () => (
  <SafeAreaView>
    <Button
      onPress={() => {
        supabase.auth.signOut()
      }}
    >
      Log Out
    </Button>
  </SafeAreaView>
)

export default Profile
