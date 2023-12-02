import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { postModel } from '../models/post'
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
    // Insert the new post at the very top of feeds so users can see their newly-created
    // post more obviously
    onSuccess: async post => {
      queryClient.setQueriesData(
        { queryKey: ['posts'], exact: true },
        (prevPostsData: unknown) => {
          const prevPosts = postModel.schema
            .array()
            .optional()
            .parse(prevPostsData)

          return prevPosts ? [post, ...prevPosts] : prevPosts
        }
      )

      queryClient.setQueriesData(
        {
          queryKey: ['posts', 'community', post.community_domain_name],
          predicate: query => {
            const queryKeyParams = z
              .object({
                sortBy: z.string(),
                filterBy: z.string()
              })
              .optional()
              .parse(query.queryKey[3])

            if (!queryKeyParams) {
              return false
            }

            if (queryKeyParams.filterBy === 'all') {
              return true
            }

            return (
              (post.is_private && queryKeyParams.filterBy === 'private') ||
              (!post.is_private && queryKeyParams.filterBy === 'public')
            )
          }
        },
        (prevPostsData: unknown) => {
          const prevPosts = postModel.schema
            .array()
            .optional()
            .parse(prevPostsData)

          return prevPosts ? [post, ...prevPosts] : prevPosts
        }
      )

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })

  return { createPost: mutate, error, isPending }
}
