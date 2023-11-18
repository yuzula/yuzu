import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { postModel } from '../models/post'
import { postService } from '../services/post'
import { FilterBy, SortBy } from '../types/post'
import { Vote } from '../types/vote'
import { useProfileContext } from './useProfileContext'

interface UsePostsParams {
  communityDomainName?: string
}

export const usePosts = ({ communityDomainName }: UsePostsParams = {}) => {
  const { profile } = useProfileContext()

  const [posts, setPosts] = useState<postModel.Schema[]>([])
  const [sortBy, setSortBy] = useState<SortBy>('hot')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const getPosts = useCallback(async () => {
    if (!profile) {
      Sentry.Native.captureException(new NotAuthenticatedError())

      return Alert.alert('You are not authenticated', GENERIC_ERROR_MESSAGE)
    }

    setIsLoading(true)

    try {
      setPosts(
        await postService.getAll({
          communityDomainName,
          sortBy,
          filterBy
        })
      )
    } catch (error) {
      Sentry.Native.captureException(error)

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
      setIsLoadingOnMount(false)
    }
  }, [communityDomainName, filterBy, profile, sortBy])

  const sortPosts = useCallback(async (sortBy: SortBy) => {
    setSortBy(sortBy)
  }, [])

  const filterPosts = useCallback(async (filterBy: FilterBy) => {
    setFilterBy(filterBy)
  }, [])

  const refreshPosts = useCallback(async () => {
    await getPosts()
  }, [getPosts])

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

      setPosts(prevPosts => {
        const prevPostsCopy = [...prevPosts]

        const post = prevPostsCopy.find(post => post.id === postId)

        if (!post) {
          Sentry.Native.captureException(new Error('Could not find voted post'))

          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)

          return prevPostsCopy
        }

        post.current_user_vote = vote
        post.vote_count += delta

        return prevPostsCopy
      })

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      await postService.registerVote({
        postId,
        userId: profile.id,
        vote
      })
    },
    [profile]
  )

  useEffect(() => {
    getPosts()
  }, [getPosts])

  return {
    posts,
    isLoadingOnMount,
    isLoading,
    sortBy,
    sortPosts,
    filterBy,
    filterPosts,
    refreshPosts,
    votePost
  }
}
