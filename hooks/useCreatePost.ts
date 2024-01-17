import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { postService } from '../services/post'
import { useAuthenticatedProfile } from './useAuthenticatedProfile'

interface CreatePostParams {
  communityDomainName: string
  content: string
  isPrivate: boolean
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  const { profile } = useAuthenticatedProfile()

  return useMutation({
    mutationFn: ({
      communityDomainName,
      content,
      isPrivate
    }: CreatePostParams) =>
      postService.create({
        communityDomainName,
        content,
        userId: profile.id,
        isPrivate
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
}
