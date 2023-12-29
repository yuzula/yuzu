import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { commentService } from '../services/comment'

interface DeleteCommentParams {
  commentId: number
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentParams) =>
      commentService.markAsDeleted(commentId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
}
