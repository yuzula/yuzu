import { useActionSheet } from '@expo/react-native-action-sheet'
import React, { FunctionComponent, useCallback } from 'react'
import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import useAuth from '../hooks/useAuth'
import * as userService from '../services/user'

const Me: FunctionComponent = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const { user } = useAuth()

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

  const handleDeleteAccountButtonPress = useCallback(async () => {
    try {
      await userService.deleteCurrentUser()
      await userService.logout()
    } catch (error) {
      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    }
  }, [])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white py-6"
      edges={['top']}
    >
      {user && (
        <View className="mx-auto w-5/6 flex-1 justify-between space-y-4">
          <View className="space-y-4">
            <Text
              className="text-center font-Poppins_600SemiBold text-2xl underline decoration-primary"
              style={{ textDecorationStyle: 'double' }}
            >
              {user.user_metadata.username}
            </Text>
          </View>
          <View className="space-y-2">
            <Button
              variant="secondary"
              onPress={handleDeleteAccountButtonPress}
            >
              Delete my account
            </Button>
            <Button onPress={handleLogOutButtonPress}>Log Out</Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Me
