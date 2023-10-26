import { useActionSheet } from '@expo/react-native-action-sheet'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import useCurrentUser from '../hooks/useCurrentUser'
import * as profileModel from '../models/profile'
import * as profileService from '../services/profile'

const Me: FunctionComponent = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const user = useCurrentUser()
  const [profile, setProfile] = useState<profileModel.Schema>()

  const handleLogOutButtonPress = useCallback(async () => {
    showActionSheetWithOptions(
      {
        title: 'Are you sure you want to log out?',
        options: ['Log Out', 'Cancel'],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 1
      },
      async index => {
        switch (index) {
          case 0:
            const result = await supabase.auth.signOut()

            if (result.error) {
              Alert.alert(result.error.message, GENERIC_ERROR_MESSAGE)
            }
            break
          default:
        }
      }
    )
  }, [showActionSheetWithOptions])

  useEffect(() => {
    ;(async () => {
      if (user) {
        try {
          setProfile(await profileService.get(user.id))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    })()
  }, [user])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white py-6"
      edges={['top']}
    >
      {!user || !profile ? (
        <ActivityIndicator />
      ) : (
        <View className="mx-auto w-5/6 flex-1 justify-between space-y-4">
          <View className="space-y-4">
            <Text
              className="font-Poppins_600SemiBold text-2xl underline decoration-primary"
              style={{ textDecorationStyle: 'double' }}
            >
              Logged in as:&nbsp;
              <Text>{profile.username}</Text>
            </Text>

            <Text className="font-Poppins_600SemiBold text-2xl">
              Number of posts: 13
            </Text>
            <Text className="font-Poppins_600SemiBold text-2xl">
              Number of replies: 15
            </Text>
            <Text className="font-Poppins_600SemiBold text-2xl">
              Total upvotes: 19
            </Text>
          </View>
          <View className="space-y-2">
            <Button variant="secondary">Delete my account</Button>
            <Button onPress={handleLogOutButtonPress}>Log Out</Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Me
