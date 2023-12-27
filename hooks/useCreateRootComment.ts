import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { commentService } from '../services/comment'
import { useAuthenticatedProfile } from './useAuthenticatedProfile'

interface CreateRootCommentParams {
  postId: number
  content: string
}

export const useCreateRootComment = () => {
  const queryClient = useQueryClient()

  const { profile } = useAuthenticatedProfile()

  return useMutation({
    mutationFn: ({ postId, content }: CreateRootCommentParams) =>
      commentService.create({
        postId,
        userId: profile.id,
        content
      }),
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
