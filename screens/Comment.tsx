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

import { Comment as CommentComponent } from '../components/Comment'
import { CommentEllipsisButton } from '../components/CommentEllipsisButton'
import { Comments } from '../components/Comments'
import { CommentSkeleton } from '../components/CommentSkeleton'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useChildComments } from '../hooks/useChildComments'
import { useComment } from '../hooks/useComment'
import { usePost } from '../hooks/usePost'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { commentModel } from '../models/comment'
import { RootStackScreenProps } from '../types'

export const Comment: FunctionComponent<RootStackScreenProps<'Comment'>> = ({
  navigation,
  route: {
    params: { postId, commentId }
  }
}) => {
  const [isPostInitialLoading, setIsPostInitialLoading] = useState(true)
  const [areCommentsInitialLoading, setAreCommentsInitialLoading] =
    useState(true)
  const [isCommentInitialLoading, setIsCommentInitialLoading] = useState(true)

  const {
    data: post,
    error: postError,
    isFetching: isPostFetching,
    refetch: refetchPost
  } = usePost(postId)

  const {
    data: comment,
    error: commentError,
    isFetching: isCommentFetching,
    refetch: refetchComment
  } = useComment(commentId)

  const {
    data: commentsData,
    error: commentsError,
    isFetching: areCommentsFetching,
    refetch: refetchComments,
    fetchNextPage: fetchCommentsNextPage,
    hasNextPage: hasCommentsNextPage,
    isFetchingNextPage: areCommentsFetchingNextPage
  } = useChildComments({ commentId })

  const { refresh: refreshPost, isRefreshing: isPostRefreshing } =
    useUserRefresh(refetchPost)
  const { refresh: refreshComment, isRefreshing: isCommentRefreshing } =
    useUserRefresh(refetchComment)
  const { refresh: refreshComments, isRefreshing: areCommentsRefreshing } =
    useUserRefresh(refetchComments)

  useEffect(() => {
    if (!isPostFetching) {
      setIsPostInitialLoading(false)
    }
  }, [areCommentsFetching, isPostFetching])

  useEffect(() => {
    if (!areCommentsFetching) {
      setAreCommentsInitialLoading(false)
    }
  }, [areCommentsFetching])

  useEffect(() => {
    if (!isCommentFetching) {
      setIsCommentInitialLoading(false)
    }
  }, [areCommentsFetching, isCommentFetching])

  useEffect(() => {
    if (postError) {
      Sentry.Native.captureException(postError)

      Alert.alert('Could not fetch post', GENERIC_ERROR_MESSAGE)
    }
  }, [postError])

  useEffect(() => {
    if (commentError) {
      Sentry.Native.captureException(commentError)

      Alert.alert('Could not fetch comment', GENERIC_ERROR_MESSAGE)
    }
  }, [commentError])

  useEffect(() => {
    if (commentsError) {
      Sentry.Native.captureException(commentsError)

      Alert.alert('Could not fetch comments', GENERIC_ERROR_MESSAGE)
    }
  }, [commentsError])

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Post', { postId })
    }
  }, [navigation, postId])

  const handleHeaderReplyButtonPress = useCallback(() => {
    if (!post) {
      Sentry.Native.captureException('Post is not defined')

      return Alert.alert('Could not reply to comment', GENERIC_ERROR_MESSAGE)
    }

    if (!comment) {
      Sentry.Native.captureException('Comment is not defined')

      return Alert.alert('Could not reply to comment', GENERIC_ERROR_MESSAGE)
    }

    navigation.navigate('CreateComment', {
      postId: post.id,
      parentCommentId: comment.id,
      replyingTo: 'comment',
      replyingToUsername: comment.username,
      replyingToContent: comment.content,
      replyingToCreatedAtTs: comment.created_at.getTime(),
      isReplyingToDeleted: comment.is_deleted,
      isReplyingToFlagged: comment.is_flagged,
      isReplyingToBlocked: comment.is_blocked
    })
  }, [comment, navigation, post])

  const handleCommentReplyButtonPress = useCallback(
    (comment: commentModel.Schema) => {
      if (!post) {
        Sentry.Native.captureException('Post is not defined')

        return Alert.alert('Could not reply to comment', GENERIC_ERROR_MESSAGE)
      }

      navigation.navigate('CreateComment', {
        postId: post.id,
        parentCommentId: comment.id,
        replyingTo: 'comment',
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
      post && comment ? (
        <View className="border-b border-gray-100">
          <CommentComponent
            isHeader
            comment={comment}
            communityDomainName={post.community_domain_name}
            isAuthorInternal={comment.is_author_internal}
            isPostPrivate={post.is_private}
            onReplyButtonPress={handleHeaderReplyButtonPress}
          />
        </View>
      ) : null,
    [comment, handleHeaderReplyButtonPress, post]
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

  const handleListRefresh = useCallback(() => {
    refreshPost()
    refreshComment()
    refreshComments()
  }, [refreshComment, refreshComments, refreshPost])

  const areResourcesLoading =
    isPostInitialLoading || isCommentInitialLoading || areCommentsInitialLoading

  const areResourcesDefined = post && comment

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
              Comment
            </Text>
            <View className="w-10 items-end justify-center">
              {comment &&
                !comment.is_deleted &&
                !comment.is_flagged &&
                !comment.is_blocked && (
                  <CommentEllipsisButton
                    comment={comment}
                    size={16}
                    variant="parent"
                  />
                )}
            </View>
          </View>
        </View>

        {areResourcesLoading || !areResourcesDefined ? (
          <CommentSkeleton />
        ) : (
          <Comments
            areCommentsFetching={areCommentsFetching}
            areCommentsFetchingNextPage={areCommentsFetchingNextPage}
            comments={commentsData?.pages.map(page => page.comments).flat(1)}
            communityDomainName={post.community_domain_name}
            fetchCommentsNextPage={fetchCommentsNextPage}
            hasCommentsNextPage={hasCommentsNextPage}
            isPostPrivate={post.is_private}
            renderListHeader={renderListHeader}
            variant="child"
            isRefreshing={
              isPostRefreshing || isCommentRefreshing || areCommentsRefreshing
            }
            onCommentPress={handleCommentPress}
            onCommentReplyButtonPress={handleCommentReplyButtonPress}
            onRefresh={handleListRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
