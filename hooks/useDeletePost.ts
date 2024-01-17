import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { postService } from '../services/post'

interface DeletePostParams {
  postId: number
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId }: DeletePostParams) =>
      postService.markAsDeleted(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['post'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      ])

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
}
