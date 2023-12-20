import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { commentModel } from '../models/comment'
import { commentService } from '../services/comment'
import { Vote } from '../types/vote'
import { useAuthenticatedProfile } from './useAuthenticatedProfile'

interface VoteCommentParams {
  commentId: number
  vote?: Vote
  delta: number
}

export const useVoteComment = () => {
  const queryClient = useQueryClient()

  const { profile } = useAuthenticatedProfile()

  return useMutation({
    mutationFn: ({ commentId, vote }: VoteCommentParams) =>
      commentService.registerVote({
        commentId,
        userId: profile.id,
        vote
      }),
    // Optimistically update comment vote across all comments
    onMutate: async ({ commentId, vote, delta }) => {
      const prevCommentsQueries = queryClient.getQueriesData({
        queryKey: ['comments']
      })

      const prevCommentQuery = queryClient.getQueryData(['comment', commentId])

      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        (prevCommentsData: unknown) => {
          const parsedPrevCommentsData = z
            .object({
              pages: z
                .object({
                  comments: commentModel.schema.array(),
                  hasNextPage: z.boolean()
                })
                .array()
            })
            .passthrough()
            .optional()
            .parse(prevCommentsData)

          if (parsedPrevCommentsData) {
            const prevComment = parsedPrevCommentsData.pages
              .find(page =>
                page.comments.some(comment => comment.id === commentId)
              )
              ?.comments.find(comment => comment.id === commentId)

            if (prevComment) {
              prevComment.current_user_vote = vote
              prevComment.vote_count += delta
            }
          }

          return parsedPrevCommentsData
        }
      )

      queryClient.setQueryData(
        ['comment', commentId],
        (prevCommentData: unknown) => {
          const parsedPrevCommentData = commentModel.schema
            .optional()
            .parse(prevCommentData)

          if (parsedPrevCommentData) {
            parsedPrevCommentData.current_user_vote = vote
            parsedPrevCommentData.vote_count += delta
          }

          return parsedPrevCommentData
        }
      )

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      return {
        prevCommentsQueries,
        prevCommentQuery
      }
    },
    onError: async (error, { commentId }, context) => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      if (!context) {
        Sentry.Native.captureException('Context is not defined')
        return
      }

      queryClient.setQueriesData(
        { queryKey: ['comments'] },
        context.prevCommentsQueries
      )

      queryClient.setQueryData(['comment', commentId], context.prevCommentQuery)
    }
  })
}
