import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { commentModel } from '../models/comment'
import { commentService } from '../services/comment'
import { Vote } from '../types/vote'
import { useProfileContext } from './useProfileContext'

export const useComments = (postId: number) => {
  const { profile } = useProfileContext()

  const [comments, setComments] = useState<commentModel.Schema[]>([])
  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getComments = useCallback(async () => {
    if (profile) {
      try {
        setComments(await commentService.getAllRoot(postId))
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoadingOnMount(false)
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
      parentCommentId,
      vote,
      delta
    }: {
      commentId: number
      parentCommentId?: number
      vote?: Vote
      delta: number
    }) => {
      if (!profile) {
        Sentry.Native.captureException(new NotAuthenticatedError())

        return Alert.alert('You are not authenticated', GENERIC_ERROR_MESSAGE)
      }

      setComments(prevComments => {
        const prevCommentsCopy = [...prevComments]

        const comment = parentCommentId
          ? prevCommentsCopy
              .find(comment => comment.id === parentCommentId)
              ?.children.find(comment => comment.id === commentId)
          : prevCommentsCopy.find(comment => comment.id === commentId)

        if (!comment) {
          Sentry.Native.captureException(
            new Error('Could not find voted comment')
          )

          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)

          return prevCommentsCopy
        }

        comment.current_user_vote = vote
        comment.vote_count += delta

        return prevCommentsCopy
      })

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      await commentService.registerVote({
        commentId,
        userId: profile.id,
        vote
      })
    },
    [profile]
  )

  useEffect(() => {
    getComments()
  }, [getComments])

  return {
    comments,
    getComments,
    refreshComments,
    isRefreshing,
    voteComment,
    isLoadingOnMount
  }
}
