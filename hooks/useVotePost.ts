import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { postModel } from '../models/post'
import { postService } from '../services/post'
import { Vote } from '../types/vote'
import { useProfileContext } from './useProfileContext'

interface VotePostParams {
  postId: number
  vote?: Vote
  delta: number
}

export const useVotePost = () => {
  const queryClient = useQueryClient()

  const { profile } = useProfileContext()

  const { mutate, error } = useMutation({
    mutationFn: ({ postId, vote }: VotePostParams) => {
      if (!profile) {
        throw new NotAuthenticatedError()
      }

      return postService.registerVote({
        postId,
        userId: profile.id,
        vote
      })
    },
    // Optimistically update post vote across all posts
    onMutate: async ({ postId, vote, delta }) => {
      const prevPostsQueries = queryClient.getQueriesData({
        queryKey: ['posts']
      })

      const prevPostQuery = queryClient.getQueryData(['post', postId])

      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (prevPostsData: unknown) => {
          const parsedPrevPostsData = z
            .object({
              pages: postModel.schema.array().array(),
              pageParams: z.unknown()
            })
            .optional()
            .parse(prevPostsData)

          if (parsedPrevPostsData) {
            const prevPost = parsedPrevPostsData.pages
              .find(page => page.some(post => post.id === postId))
              ?.find(post => post.id === postId)

            if (prevPost) {
              prevPost.current_user_vote = vote
              prevPost.vote_count += delta
            }
          }

          return parsedPrevPostsData
        }
      )

      queryClient.setQueryData(['post', postId], (prevPostData: unknown) => {
        const parsedPrevPostData = postModel.schema
          .optional()
          .parse(prevPostData)

        if (parsedPrevPostData) {
          parsedPrevPostData.current_user_vote = vote
          parsedPrevPostData.vote_count += delta
        }

        return parsedPrevPostData
      })

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      return { prevPostsQueries, prevPostQuery }
    },
    onError: async (error, { postId }, context) => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      if (!context) {
        Sentry.Native.captureException('Context is not defined')
        return
      }

      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        context.prevPostsQueries
      )

      queryClient.setQueryData(['post', postId], context.prevPostQuery)
    }
  })

  return {
    votePost: mutate,
    error
  }
}
