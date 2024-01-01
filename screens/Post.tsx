import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View
} from 'react-native'
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

  const handleBlockAuthorButtonPress = useCallback(
    (authorId: string) => {
      if (!post) {
        return Alert.alert('Could not get post', GENERIC_ERROR_MESSAGE)
      }

      blockUser({ userId: authorId })

      if (authorId === post.user_id) {
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.replace('Tabs')
        }
      }
    },
    [blockUser, navigation, post]
  )

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
                      handleBlockAuthorButtonPress(post.user_id)
                    }
                  }
                }
              ]
            )
          }
        }
      ])
    },
    [handleBlockAuthorButtonPress, reportPost]
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

                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.replace('Tabs')
                }
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
            handleBlockAuthorButtonPress(post.user_id)
          }
        }
      )
    }
  }, [
    deletePost,
    handleBlockAuthorButtonPress,
    handleReportPostButtonPress,
    navigation,
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

    navigation.push('CreateComment', {
      postId: post.id,
      postAuthorUsername: post.username,
      postContent: post.content,
      postCreatedAtTs: post.created_at.getTime()
    })
  }, [navigation, post])

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full flex-1"
      >
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
            onRefresh={handleListRefresh}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
