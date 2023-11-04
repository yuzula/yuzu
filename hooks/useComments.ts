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

  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const getComments = useCallback(async () => {
    if (profile) {
      setIsLoading(true)

      try {
        setComments(
          await retryPromise(() =>
            commentService.getAllRoot({ postId, userId: profile.id })
          )
        )
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoadingOnMount(false)
        setIsLoading(false)
      }
    }
  }, [postId, profile])

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
    refresh: getComments,
    voteComment,
    isLoadingOnMount,
    isLoading
  }
}
