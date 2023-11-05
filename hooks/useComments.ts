import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { retryPromise } from '../helpers/promise'
import { getResultingVote } from '../helpers/vote'
import { commentModel } from '../models/comment'
import { commentService } from '../services/comment'
import { useProfileContext } from './useProfileContext'

export const useComments = (postId: number) => {
  const { profile } = useProfileContext()

  const [comments, setComments] = useState<commentModel.Schema[]>()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const getComments = useCallback(async () => {
    if (profile) {
      try {
        setComments(
          await retryPromise(() =>
            commentService.getAllRoot({ postId, userId: profile.id })
          )
        )
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [postId, profile])

  const refreshComments = useCallback(async () => {
    setIsRefreshing(true)

    await getComments()

    setIsRefreshing(false)
  }, [getComments])

  const voteComment = useCallback(
    async ({
      commentId,
      userId,
      parentCommentId,
      vote
    }: {
      commentId: number
      userId: string
      parentCommentId?: number
      vote: 'upvote' | 'downvote'
    }) => {
      if (comments) {
        const newComments = [...comments]

        const newComment = parentCommentId
          ? newComments
              .find(comment => comment.id === parentCommentId)
              ?.children.find(comment => comment.id === commentId)
          : newComments.find(comment => comment.id === commentId)

        if (!newComment) {
          Sentry.Native.captureException(
            new Error('Could not find voted comment')
          )

          return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }

        const oldVote = newComment.current_user_vote

        const resultingVote = getResultingVote({
          oldVote,
          vote
        })

        newComment.current_user_vote = resultingVote.newVote
        newComment.vote_count += resultingVote.delta

        setComments(newComments)

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        await retryPromise(() =>
          commentService.registerVote({
            commentId,
            userId,
            oldVote,
            vote
          })
        )
      }
    },
    [comments]
  )

  useEffect(() => {
    getComments()
  }, [getComments])

  return {
    comments,
    getComments,
    refreshComments,
    isRefreshing,
    voteComment
  }
}
