import { useActionSheet } from '@expo/react-native-action-sheet'
import React, { FunctionComponent, useCallback } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'

const Me: FunctionComponent = () => {
  const { showActionSheetWithOptions } = useActionSheet()

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

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="w-5/6">
        <Button onPress={handleLogOutButtonPress}>Log Out</Button>
      </View>
    </SafeAreaView>
  )
}

export default Me
