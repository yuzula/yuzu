import { useActionSheet } from '@expo/react-native-action-sheet'
import React, { FunctionComponent, useCallback } from 'react'
import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { useAuthContext } from '../hooks/useAuthContext'
import { useDeleteCurrentUser } from '../hooks/useDeleteCurrentUser'
import { useLogOut } from '../hooks/useLogOut'

export const Me: FunctionComponent = () => {
  const { showActionSheetWithOptions } = useActionSheet()

  const { user } = useAuthContext()

  const { logOut, isLoading: isLogOutLoading } = useLogOut()

  const { deleteCurrentUser, isLoading: isDeleteCurrentUserLoading } =
    useDeleteCurrentUser()

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
            try {
              await logOut()
            } catch (error) {
              Sentry.Native.captureException(error)

              Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
            }
            break
          default:
        }
      }
    )
  }, [logOut, showActionSheetWithOptions])

  const handleDeleteAccountButtonPress = useCallback(async () => {
    Alert.alert('Are you sure you want to delete your account?', undefined, [
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCurrentUser()
            await logOut()
          } catch (error) {
            Sentry.Native.captureException(error)

            Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
          }
        }
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ])
  }, [deleteCurrentUser, logOut])

  if (!user) {
    return null
  }

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white py-6"
      edges={['top']}
    >
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
            isDisabled={isLogOutLoading}
            isLoading={isDeleteCurrentUserLoading}
            variant="secondary"
            onPress={handleDeleteAccountButtonPress}
          >
            Delete my account
          </Button>
          <Button
            isDisabled={isDeleteCurrentUserLoading}
            isLoading={isLogOutLoading}
            onPress={handleLogOutButtonPress}
          >
            Log Out
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}
