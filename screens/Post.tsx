import { useActionSheet } from '@expo/react-native-action-sheet'
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
import { PostSkeleton } from '../components/PostSkeleton'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeletePost } from '../hooks/useDeletePost'
import { usePost } from '../hooks/usePost'
import { useReportPost } from '../hooks/useReportPost'
import { useRootComments } from '../hooks/useRootComments'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { commentModel } from '../models/comment'
import { postModel } from '../models/post'
import { RootStackScreenProps } from '../types'

export const Post: FunctionComponent<RootStackScreenProps<'Post'>> = ({
  navigation,
  route: {
    params: { postId }
  }
}) => {
  const [areCommentsInitialLoading, setAreCommentsInitialLoading] =
    useState(true)
  const [isPostInitialLoading, setIsPostInitialLoading] = useState(true)

  const { showActionSheetWithOptions } = useActionSheet()

  const { profile } = useAuthenticatedProfile()

  const {
    data: post,
    error: postError,
    isFetching: isPostFetching,
    refetch: refetchPost
  } = usePost(postId)

  const { mutate: deletePost, error: deletePostError } = useDeletePost()

  const { mutate: blockUser, error: blockUserError } = useBlockUser()

  const { mutate: reportPost, error: reportPostError } = useReportPost()

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

  useEffect(() => {
    if (deletePostError) {
      Alert.alert('Could not delete post', GENERIC_ERROR_MESSAGE)
    }
  }, [deletePostError])

  useEffect(() => {
    if (blockUserError) {
      Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
    }
  }, [blockUserError])

  useEffect(() => {
    if (reportPostError) {
      Alert.alert('Could not report post', GENERIC_ERROR_MESSAGE)
    }
  }, [reportPostError])

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Tabs')
    }
  }, [navigation])

  const handleReportPostButtonPress = useCallback(
    (post: postModel.Schema) => {
      reportPost({ postId: post.id })

      Alert.alert('Post has been reported for moderation', undefined, [
        {
          onPress: () => {
            Alert.alert(
              'Would you like to block the author of the post?',
              undefined,
              [
                {
                  text: 'No'
                },
                {
                  text: 'Yes',
                  onPress: () => {
                    if (post.user_id) {
                      blockUser({ userId: post.user_id })
                    }
                  }
                }
              ]
            )
          }
        }
      ])
    },
    [blockUser, reportPost]
  )

  const handleListRefresh = useCallback(() => {
    refreshPost()
    refreshComments()
  }, [refreshComments, refreshPost])

  const handlePostEllipsisButtonPress = useCallback(() => {
    if (!post) {
      return Alert.alert('Could not get post details', GENERIC_ERROR_MESSAGE)
    }

    if (profile.id === post.user_id) {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Delete this post', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1
        },
        index => {
          if (index === 1) {
            return
          }

          Alert.alert('Are you sure you want to delete this post?', undefined, [
            {
              text: 'Yes',
              style: 'destructive',
              onPress: () => {
                deletePost({ postId })
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ])
        }
      )
    } else {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Report this post', 'Block the author', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2
        },
        index => {
          if (index === 2) {
            return
          }

          if (index === 0) {
            handleReportPostButtonPress(post)
          } else if (index === 1 && post.user_id) {
            blockUser({ userId: post.user_id })
          }
        }
      )
    }
  }, [
    blockUser,
    deletePost,
    handleReportPostButtonPress,
    post,
    postId,
    profile.id,
    showActionSheetWithOptions
  ])

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

      navigation.navigate('Comment', { commentId, postId: post.id })
    },
    [navigation, post]
  )

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="w-full flex-1">
        <View className="border-b border-gray-100">
          <View className="mx-auto w-5/6 flex-row items-center justify-between">
            <Pressable className="py-4 pr-4" onPress={handleBackButtonPress}>
              <FontAwesome5 name="chevron-left" size={16} />
            </Pressable>
            <Text
              className="shrink text-center font-Poppins_700Bold text-base"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              Post
            </Text>
            <Pressable
              className="py-4 pl-4"
              onPress={handlePostEllipsisButtonPress}
            >
              <FontAwesome5 name="ellipsis-h" size={16} />
            </Pressable>
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
