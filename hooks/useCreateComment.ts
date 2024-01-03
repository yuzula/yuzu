import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { commentService } from '../services/comment'
import { useAuthenticatedProfile } from './useAuthenticatedProfile'

interface CreateCommentParams {
  postId: number
  content: string
  parentCommentId?: number
}

export const useCreateComment = () => {
  const queryClient = useQueryClient()

  const { profile } = useAuthenticatedProfile()

  return useMutation({
    mutationFn: ({ postId, content, parentCommentId }: CreateCommentParams) =>
      commentService.create({
        postId,
        userId: profile.id,
        content,
        parentCommentId
      }),
    onSuccess: async (_, { postId, parentCommentId }) => {
      queryClient.invalidateQueries({
        queryKey: ['comment', parentCommentId],
        exact: true
      })
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId], exact: true })
      queryClient.invalidateQueries({ queryKey: ['posts'] })

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
}
