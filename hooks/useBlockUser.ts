import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { blockService } from '../services/block'
import { useAuthenticatedProfile } from './useAuthenticatedProfile'

interface BlockUserParams {
  userId: string
}

export const useBlockUser = () => {
  const queryClient = useQueryClient()

  const { profile } = useAuthenticatedProfile()

  return useMutation({
    mutationFn: ({ userId }: BlockUserParams) =>
      blockService.blockUser({
        blockerId: profile.id,
        blockeeId: userId
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
}
