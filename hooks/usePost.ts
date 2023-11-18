import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { postModel } from '../models/post'
import { postService } from '../services/post'
import { Vote } from '../types/vote'
import { useProfileContext } from './useProfileContext'

export const usePost = (id: number) => {
  const { profile } = useProfileContext()

  const [post, setPost] = useState<postModel.Schema>()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const getPost = useCallback(async () => {
    try {
      setPost(await postService.get(id))
    } catch (error) {
      Sentry.Native.captureException(error)

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    }
  }, [id])

  const refreshPost = useCallback(async () => {
    setIsRefreshing(true)

    await getPost()

    setIsRefreshing(false)
  }, [getPost])

  const votePost = useCallback(
    async ({
      postId,
      vote,
      delta
    }: {
      postId: number
      vote?: Vote
      delta: number
    }) => {
      if (!profile) {
        Sentry.Native.captureException(new NotAuthenticatedError())

        return Alert.alert('You are not authenticated', GENERIC_ERROR_MESSAGE)
      }

      if (!post) {
        Sentry.Native.captureException(new Error('Voting on non-existent post'))

        return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }

      setPost(prevPost =>
        prevPost
          ? {
              ...prevPost,
              current_user_vote: vote,
              vote_count: prevPost.vote_count + delta
            }
          : undefined
      )

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      await postService.registerVote({
        postId,
        userId: profile.id,
        vote
      })
    },
    [post, profile]
  )

  useEffect(() => {
    getPost()
  }, [getPost])

  return { post, getPost, refreshPost, isRefreshing, votePost }
}
