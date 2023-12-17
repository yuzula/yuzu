import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { postService } from '../services/post'
import { useProfileContext } from './useProfileContext'

interface CreatePostParams {
  communityDomainName: string
  content: string
  isPrivate: boolean
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  const { profile } = useProfileContext()

  const { mutate, error, isPending } = useMutation({
    mutationFn: ({
      communityDomainName,
      content,
      isPrivate
    }: CreatePostParams) => {
      if (!profile) {
        throw new NotAuthenticatedError()
      }

      return postService.create({
        communityDomainName,
        content,
        userId: profile.id,
        isPrivate
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

  return { createPost: mutate, error, isPending }
}
