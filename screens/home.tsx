import React, { FunctionComponent, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../clients/supabase'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { ProfileSchema, profileSchema } from '../models/profile'

const Home: FunctionComponent = () => {
  const [profile, setProfile] = useState<ProfileSchema>()
  const [isProfileLoading, setIsProfileLoading] = useState(true)

  useEffect(() => {
    const doGetProfile = async () => {
      setIsProfileLoading(true)

      try {
        const user = await supabase.auth.getUser()

        if (user.error) {
          return
        }

        const profile = await supabase
          .from('profiles')
          .select()
          .eq('id', user.data.user.id)
          .single()

        setProfile(profileSchema.parse(profile.data))
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsProfileLoading(false)
      }
    }

    doGetProfile()
  }, [])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      {isProfileLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="w-5/6 flex-1 pt-2">
          <View className="space-y-2">
            <Text className="font-Poppins_700Bold text-xl">
              {profile?.community_domain_name}
            </Text>
            <Text className="font-Poppins_400Regular text-apple-gray-light">
              452 members
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Home
