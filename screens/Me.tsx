import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useDeleteCurrentUser } from '../hooks/useDeleteCurrentUser'
import { useLogOut } from '../hooks/useLogOut'

export const Me: FunctionComponent = () => {
  const { profile } = useAuthenticatedProfile()

  const { logOut, isLoading: isLogOutLoading } = useLogOut()

  const {
    mutate: deleteCurrentUser,
    isPending: isDeleteCurrentUserPending,
    error: deleteCurrentUserError
  } = useDeleteCurrentUser()

  useEffect(() => {
    if (deleteCurrentUserError) {
      Alert.alert('Could not delete current user', GENERIC_ERROR_MESSAGE)
    }
  }, [deleteCurrentUserError])

  const handleLogOutButtonPress = useCallback(() => {
    Alert.alert('Are you sure you want to log out?', undefined, [
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          await logOut()
        }
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ])
  }, [logOut])

  const handleDeleteAccountButtonPress = useCallback(() => {
    Alert.alert('Are you sure you want to delete your account?', undefined, [
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          deleteCurrentUser()
        }
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ])
  }, [deleteCurrentUser])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white py-6"
      edges={['top']}
    >
      <View className="mx-auto w-5/6 flex-1 justify-between space-y-4">
        <View className="space-y-4">
          <Text className="text-center font-Poppins_600SemiBold text-2xl">
            {profile.username}
          </Text>
        </View>
        <View className="space-y-2">
          <Button
            isDisabled={isLogOutLoading}
            isLoading={isDeleteCurrentUserPending}
            variant="secondary"
            onPress={handleDeleteAccountButtonPress}
          >
            Delete my account
          </Button>
          <Button
            isDisabled={isDeleteCurrentUserPending}
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
