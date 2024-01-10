import { useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { userService } from '../services/user'

export const useDeleteCurrentUser = () =>
  useMutation({
    mutationFn: userService.deleteCurrentUser,
    onSuccess: async () => {
      await userService.logOut()
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
