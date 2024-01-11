import { FontAwesome5 } from '@expo/vector-icons'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Comments } from '../components/Comments'
import { PostCommentsHeader } from '../components/PostCommentsHeader'
import { PostEllipsisButton } from '../components/PostEllipsisButton'
import { PostSkeleton } from '../components/PostSkeleton'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { usePost } from '../hooks/usePost'
import { useRootComments } from '../hooks/useRootComments'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { commentModel } from '../models/comment'
import { RootStackScreenProps } from '../navigation/types'

export const Post: FunctionComponent<RootStackScreenProps<'Post'>> = ({
  navigation,
  route: {
    params: { postId }
  }
}) => {
  const [areCommentsInitialLoading, setAreCommentsInitialLoading] =
    useState(true)
  const [isPostInitialLoading, setIsPostInitialLoading] = useState(true)

  const {
    data: post,
    error: postError,
    isFetching: isPostFetching,
    refetch: refetchPost
  } = usePost(postId)
  const {
    data: commentsData,
    error: commentsError,
    isFetching: areCommentsFetching,
    refetch: refetchComments,
    fetchNextPage: fetchCommentsNextPage,
    hasNextPage: hasCommentsNextPage,
    isFetchingNextPage: areCommentsFetchingNextPage
  } = useRootComments({ postId })

  const { refresh: refreshComments, isRefreshing: areCommentsRefreshing } =
    useUserRefresh(refetchComments)
  const { refresh: refreshPost, isRefreshing: isPostRefreshing } =
    useUserRefresh(refetchPost)

  useEffect(() => {
    if (!areCommentsFetching) {
      setAreCommentsInitialLoading(false)
    }
  }, [areCommentsFetching])

  useEffect(() => {
    if (!isPostFetching) {
      setIsPostInitialLoading(false)
    }
  }, [areCommentsFetching, isPostFetching])

  useEffect(() => {
    if (postError) {
      Sentry.Native.captureException(postError)

      Alert.alert('Could not fetch post', GENERIC_ERROR_MESSAGE)
    }
  }, [postError])

  useEffect(() => {
    if (commentsError) {
      Sentry.Native.captureException(commentsError)

      Alert.alert('Could not fetch comments', GENERIC_ERROR_MESSAGE)
    }
  }, [commentsError, postError])

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Tabs')
    }
  }, [navigation])

  const handleListRefresh = useCallback(() => {
    refreshPost()
    refreshComments()
  }, [refreshComments, refreshPost])

  const handleHeaderReplyButtonPress = useCallback(() => {
    if (!post) {
      Sentry.Native.captureException('Post is not defined')

      return Alert.alert('Could not reply to post', GENERIC_ERROR_MESSAGE)
    }

    navigation.navigate('CreateComment', {
      postId: post.id,
      replyingTo: 'post',
      replyingToUsername: post.username,
      replyingToContent: post.content,
      replyingToCreatedAtTs: post.created_at.getTime(),
      isReplyingToDeleted: post.is_deleted,
      isReplyingToFlagged: post.is_flagged,
      isReplyingToBlocked: post.is_blocked
    })
  }, [navigation, post])

  const handleCommentReplyButtonPress = useCallback(
    (comment: commentModel.Schema) => {
      if (!post) {
        Sentry.Native.captureException('Post is not defined')

        return Alert.alert('Could not reply to post', GENERIC_ERROR_MESSAGE)
      }

      navigation.navigate('CreateComment', {
        postId: post.id,
        parentCommentId: comment.id,
        replyingTo: 'post',
        replyingToUsername: comment.username,
        replyingToContent: comment.content,
        replyingToCreatedAtTs: comment.created_at.getTime(),
        isReplyingToDeleted: comment.is_deleted,
        isReplyingToFlagged: comment.is_flagged,
        isReplyingToBlocked: comment.is_blocked
      })
    },
    [navigation, post]
  )

  const renderListHeader = useCallback(
    () =>
      post ? (
        <PostCommentsHeader
          post={post}
          onReplyButtonPress={handleHeaderReplyButtonPress}
        />
      ) : null,
    [handleHeaderReplyButtonPress, post]
  )

  const handleCommentPress = useCallback(
    (commentId: number) => {
      if (!post) {
        Sentry.Native.captureException('Post is not defined')

        return Alert.alert(
          'Could not fetch post details',
          GENERIC_ERROR_MESSAGE
        )
      }

      navigation.push('Comment', { commentId, postId: post.id })
    },
    [navigation, post]
  )

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="w-full flex-1">
        <View className="border-b border-gray-100">
          <View className="mx-auto w-5/6 flex-row items-center justify-between py-4">
            <View className="w-10 items-start justify-center">
              <Pressable onPress={handleBackButtonPress}>
                <FontAwesome5 name="chevron-left" size={16} />
              </Pressable>
            </View>
            <Text
              className="shrink text-center font-Poppins_700Bold text-base"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              Post
            </Text>
            <View className="w-10 items-end justify-center">
              {post &&
                !post.is_deleted &&
                !post.is_flagged &&
                !post.is_blocked && (
                  <PostEllipsisButton post={post} size={16} variant="parent" />
                )}
            </View>
          </View>
        </View>

        {isPostInitialLoading || areCommentsInitialLoading || !post ? (
          <PostSkeleton />
        ) : (
          <Comments
            areCommentsFetching={areCommentsFetching}
            areCommentsFetchingNextPage={areCommentsFetchingNextPage}
            comments={commentsData?.pages.map(page => page.comments).flat(1)}
            communityDomainName={post.community_domain_name}
            fetchCommentsNextPage={fetchCommentsNextPage}
            hasCommentsNextPage={hasCommentsNextPage}
            isPostPrivate={post.is_private}
            isRefreshing={isPostRefreshing || areCommentsRefreshing}
            renderListHeader={renderListHeader}
            onCommentPress={handleCommentPress}
            onCommentReplyButtonPress={handleCommentReplyButtonPress}
            onRefresh={handleListRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
