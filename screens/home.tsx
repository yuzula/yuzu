import { User } from '@supabase/supabase-js'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { ProfileSchema, profileSchema } from '../models/profile'

const Home: FunctionComponent = () => {
  const [user, setUser] = useState<User>()
  const [profile, setProfile] = useState<ProfileSchema>()
  const [memberCount, setMemberCount] = useState<number>()

  useEffect(() => {
    const doGetUser = async () => {
      try {
        const user = await supabase.auth.getUser()

        if (user.error) {
          return Alert.alert('Could not fetch user', GENERIC_ERROR_MESSAGE)
        }

        setUser(user.data.user)
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }

    doGetUser()
  }, [])

  useEffect(() => {
    const doGetProfile = async () => {
      if (user) {
        try {
          const profile = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .single()

          setProfile(profileSchema.parse(profile.data))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    }

    doGetProfile()
  }, [user])

  useEffect(() => {
    const doGetMemberCount = async () => {
      if (profile) {
        try {
          const memberCount = await supabase.rpc('count_members', {
            domain_name: profile.community_domain_name
          })

          setMemberCount(z.number().parse(memberCount.data))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    }

    doGetMemberCount()
  }, [profile, user])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      {!profile || !memberCount ? (
        <ActivityIndicator />
      ) : (
        <View className="w-5/6 flex-1 pt-6">
          <View className="space-y-2">
            <Text className="font-Poppins_700Bold text-xl">
              {profile.community_domain_name}
            </Text>
            <Text className="font-Poppins_500Medium text-apple-gray-light">
              {`${memberCount} ${memberCount > 1 ? 'members' : 'member'}`}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Home
