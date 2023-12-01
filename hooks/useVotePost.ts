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
    mutationKey: ['votePost'],
    mutationFn: async ({ postId, vote }: MutationParams) => {
      if (!profile) {
        throw new NotAuthenticatedError()
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      return postService.registerVote({
        postId,
        userId: profile.id,
        vote
      })
    },
    // Optimistically update post vote across all posts
    onMutate: ({ postId, vote, delta }) => {
      const prevPostsQueries = queryClient.getQueriesData({
        queryKey: ['posts']
      })

      queryClient.setQueriesData({ queryKey: ['posts'] }, prevPostsData => {
        const prevPosts = postModel.schema.array().parse(prevPostsData)

        const post = prevPosts.find(post => post.id === postId)

        if (!post) {
          throw new Error('Voted post not found')
        }

        post.current_user_vote = vote
        post.vote_count += delta

        return prevPosts
      })

      return { prevPostsQueries }
    },
    onError: (error, _, context) => {
      Sentry.Native.captureException(error)

      if (!context) {
        Sentry.Native.captureException('Context is not defined')
        return
      }

      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        context.prevPostsQueries
      )
    }
  })

  return {
    votePost: mutate,
    error
  }
}
