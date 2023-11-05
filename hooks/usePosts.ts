import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { retryPromise } from '../helpers/promise'
import { getResultingVote } from '../helpers/vote'
import { postModel } from '../models/post'
import { postService } from '../services/post'
import { useProfileContext } from './useProfileContext'

type SortBy = 'hot' | 'new' | 'controversial'

interface UsePostsParams {
  communityDomainName?: string
}

export const usePosts = ({ communityDomainName }: UsePostsParams) => {
  const { profile } = useProfileContext()

  const [posts, setPosts] = useState<postModel.Schema[]>([])
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'controversial'>('hot')
  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const getPosts = useCallback(async () => {
    if (!profile) {
      Sentry.Native.captureException(new NotAuthenticatedError())

      return Alert.alert('You are not authenticated', GENERIC_ERROR_MESSAGE)
    }

    if (!communityDomainName) {
      Sentry.Native.captureException(
        new Error('communityDomainName does not exist')
      )

      return Alert.alert('Could not fetch posts', GENERIC_ERROR_MESSAGE)
    }

    setIsLoading(true)

    try {
      setPosts(
        await retryPromise(() =>
          postService.getAll({
            communityDomainName,
            userId: profile.id,
            sortBy
          })
        )
      )
    } catch (error) {
      Sentry.Native.captureException(error)

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
      setIsLoadingOnMount(false)
    }
  }, [communityDomainName, profile, sortBy])

  const sortPosts = useCallback(async (sortBy: SortBy) => {
    setSortBy(sortBy)
  }, [])

  const refreshPosts = useCallback(async () => {
    await getPosts()
  }, [getPosts])

  const votePost = useCallback(
    async ({
      postId,
      vote
    }: {
      postId: number
      vote: 'upvote' | 'downvote'
    }) => {
      if (!profile) {
        Sentry.Native.captureException(new NotAuthenticatedError())

        return Alert.alert('You are not authenticated', GENERIC_ERROR_MESSAGE)
      }

      if (!posts) {
        Sentry.Native.captureException(
          new Error('Trying to vote when posts do not exist')
        )

        return Alert.alert('Could not vote on post', GENERIC_ERROR_MESSAGE)
      }

      const newPosts = [...posts]

      const newPost = newPosts.find(post => post.id === postId)

      if (!newPost) {
        Sentry.Native.captureException(new Error('Could not find voted post'))

        return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }

      const oldVote = newPost.current_user_vote

      const resultingVote = getResultingVote({
        oldVote,
        vote
      })

      newPost.current_user_vote = resultingVote.newVote
      newPost.vote_count += resultingVote.delta

      setPosts(newPosts)

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      await retryPromise(() =>
        postService.registerVote({
          postId,
          userId: profile.id,
          oldVote,
          vote
        })
      )
    },
    [posts, profile]
  )

  useEffect(() => {
    getPosts()
  }, [getPosts])

  return {
    posts,
    isLoadingOnMount,
    isLoading,
    sortPosts,
    refreshPosts,
    votePost
  }
}
