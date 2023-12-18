import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { blockService } from '../services/block'
import { useProfileContext } from './useProfileContext'

interface BlockUserParams {
  userId: string
}

export const useBlockUser = () => {
  const queryClient = useQueryClient()

  const { profile } = useProfileContext()

  return useMutation({
    mutationFn: ({ userId }: BlockUserParams) => {
      if (!profile) {
        throw new NotAuthenticatedError()
      }

      return blockService.blockUser({
        blockerId: profile.id,
        blockeeId: userId
      })
    },
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
