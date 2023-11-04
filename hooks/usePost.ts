import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { retryPromise } from '../helpers/promise'
import { getResultingVote } from '../helpers/vote'
import { postModel } from '../models/post'
import { postService } from '../services/post'
import { useProfileContext } from './useProfileContext'

export const usePost = (id: number) => {
  const { profile } = useProfileContext()

  const [post, setPost] = useState<postModel.Schema>()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const getPost = useCallback(async () => {
    if (profile) {
      try {
        setPost(
          await retryPromise(() =>
            postService.get({ postId: id, userId: profile.id })
          )
        )
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [id, profile])

  const refreshPost = useCallback(async () => {
    setIsRefreshing(true)

    await getPost()

    setIsRefreshing(false)
  }, [getPost])

  const votePost = useCallback(
    async (postId: number, userId: string, vote: 'upvote' | 'downvote') => {
      if (post) {
        const newPost = { ...post }

        const oldVote = newPost.current_user_vote

        const resultingVote = getResultingVote({
          oldVote,
          vote
        })

        newPost.current_user_vote = resultingVote.newVote
        newPost.vote_count += resultingVote.delta

        setPost(newPost)

        await retryPromise(() =>
          postService.registerVote({
            postId,
            userId,
            oldVote,
            vote
          })
        )
      }
    },
    [post]
  )

  useEffect(() => {
    getPost()
  }, [getPost])

  return { post, getPost, refreshPost, isRefreshing, votePost }
}
