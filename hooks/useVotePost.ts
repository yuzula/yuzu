import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { postModel } from '../models/post'
import { postService } from '../services/post'
import { Vote } from '../types/vote'
import { useProfileContext } from './useProfileContext'

interface MutationParams {
  postId: number
  vote?: Vote
  delta: number
}

export const useVotePost = () => {
  const queryClient = useQueryClient()

  const { profile } = useProfileContext()

  const { mutate, error } = useMutation({
    mutationFn: async ({ postId, vote }: MutationParams) => {
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
          const prevPosts = postModel.schema
            .array()
            .optional()
            .parse(prevPostsData)

          if (prevPosts) {
            const prevPost = prevPosts.find(post => post.id === postId)

            if (prevPost) {
              prevPost.current_user_vote = vote
              prevPost.vote_count += delta
            }
          }

          return prevPosts
        }
      )

      queryClient.setQueryData(['post', postId], (prevPostData: unknown) => {
        const prevPost = postModel.schema.optional().parse(prevPostData)

        if (prevPost) {
          prevPost.current_user_vote = vote
          prevPost.vote_count += delta
        }

        return prevPost
      })

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      return { prevPostsQueries, prevPostQuery }
    },
    onError: (error, { postId }, context) => {
      Sentry.Native.captureException(error)

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
