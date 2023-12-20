import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Comment } from '../components/Comment'
import { PostSkeleton } from '../components/PostSkeleton'
import { Separator } from '../components/Separator'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeletePost } from '../hooks/useDeletePost'
import { usePost } from '../hooks/usePost'
import { useReportPost } from '../hooks/useReportPost'
import { useRootComments } from '../hooks/useRootComments'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { useVoteComment } from '../hooks/useVoteComment'
import { useVotePost } from '../hooks/useVotePost'
import { commentModel } from '../models/comment'
import { postModel } from '../models/post'
import { commentService } from '../services/comment'
import { reportService } from '../services/report'
import { RootStackScreenProps } from '../types'
import { Vote } from '../types/vote'

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

  const { mutate: votePost, error: votePostError } = useVotePost()

  const { mutate: voteComment, error: voteCommentError } = useVoteComment()

  const { mutate: deletePost, error: deletePostError } = useDeletePost()

  const { mutate: blockUser, error: blockUserError } = useBlockUser()

  const { mutate: reportPost, error: reportPostError } = useReportPost()

  const {
    data: commentsData,
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
    if (votePostError) {
      Alert.alert('Could not vote on post', GENERIC_ERROR_MESSAGE)
    }
  }, [votePostError])

  useEffect(() => {
    if (voteCommentError) {
      Alert.alert('Could not vote on comment', GENERIC_ERROR_MESSAGE)
    }
  }, [voteCommentError])

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
    async (authorId: string) => {
      try {
        if (post) {
          blockUser({ userId: authorId })

          if (authorId === post.user_id) {
            if (navigation.canGoBack()) {
              navigation.goBack()
            } else {
              navigation.replace('Tabs')
            }
          }
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
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

  const handleReportCommentButtonPress = useCallback(
    async (comment: commentModel.Schema) => {
      try {
        await reportService.reportComment(comment.id)

        Alert.alert('Comment has been reported for moderation', undefined, [
          {
            onPress: () => {
              Alert.alert(
                'Would you like to block the author of the comment?',
                undefined,
                [
                  {
                    text: 'No'
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      if (comment.user_id) {
                        handleBlockAuthorButtonPress(comment.user_id)
                      }
                    }
                  }
                ]
              )
            }
          }
        ])
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress]
  )

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
        async index => {
          if (index === 2) {
            return
          }

          if (index === 0) {
            handleReportPostButtonPress(post)
          } else if (index === 1 && post.user_id) {
            await handleBlockAuthorButtonPress(post.user_id)
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

  const handleCommentEllipsisButtonPress = useCallback(
    (comment: commentModel.Schema) => {
      if (profile.id === comment.user_id) {
        showActionSheetWithOptions(
          {
            title: 'More actions',
            options: ['Delete this comment', 'Cancel'],
            destructiveButtonIndex: 0,
            cancelButtonIndex: 1
          },
          async index => {
            if (index === 1) {
              return
            }

            Alert.alert(
              'Are you sure you want to delete this comment?',
              undefined,
              [
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await commentService.markAsDeleted(comment.id)
                    } catch (error) {
                      Sentry.Native.captureException(error)

                      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
                    }
                  }
                },
                {
                  text: 'Cancel',
                  style: 'cancel'
                }
              ]
            )
          }
        )
      } else {
        showActionSheetWithOptions(
          {
            title: 'More actions',
            options: ['Report this comment', 'Block the author', 'Cancel'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 2
          },
          async index => {
            if (index === 2) {
              return
            }

            if (index === 0) {
              await handleReportCommentButtonPress(comment)
            } else if (index === 1 && comment.user_id) {
              await handleBlockAuthorButtonPress(comment.user_id)
            }
          }
        )
      }
    },
    [
      handleBlockAuthorButtonPress,
      handleReportCommentButtonPress,
      profile.id,
      showActionSheetWithOptions
    ]
  )

  const handleCommentReplyButtonPress = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (commentId: number) => {},
    []
  )

  const handlePostReplyButtonPress = useCallback(() => {}, [])

  const handlePostVoteButtonPress = useCallback(
    async ({
      postId,
      oldVote,
      vote
    }: {
      postId: number
      oldVote?: Vote
      vote: Vote
    }) => {
      const { newVote, delta } = getResultingVote({ oldVote, vote })

      votePost({ postId, vote: newVote, delta })
    },
    [votePost]
  )

  const handleCommentVoteButtonPress = useCallback(
    async ({
      commentId,
      oldVote,
      vote
    }: {
      commentId: number
      oldVote?: Vote
      vote: Vote
    }) => {
      const { newVote, delta } = getResultingVote({ oldVote, vote })

      voteComment({ commentId, vote: newVote, delta })
    },
    [voteComment]
  )

  const handleEndReached = useCallback(() => {
    if (!areCommentsFetching && hasCommentsNextPage) {
      fetchCommentsNextPage()
    }
  }, [areCommentsFetching, fetchCommentsNextPage, hasCommentsNextPage])

  const renderListFooterComponent = useCallback(() => {
    if (areCommentsFetchingNextPage) {
      return <ActivityIndicator className="py-4" />
    }

    return null
  }, [areCommentsFetchingNextPage])

  const handleListRefresh = useCallback(() => {
    refreshPost()
    refreshComments()
  }, [refreshComments, refreshPost])

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
          <FlatList
            ItemSeparatorComponent={Separator}
            ListFooterComponent={renderListFooterComponent}
            className="w-full"
            contentContainerStyle={{ flexGrow: 1 }}
            data={commentsData?.pages.map(page => page.comments).flat(1)}
            keyExtractor={item => item.id.toString()}
            keyboardDismissMode="interactive"
            refreshing={isPostRefreshing || areCommentsRefreshing}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center">
                <Text className="font-Poppins_600SemiBold text-base text-gray-light">
                  No comments yet
                </Text>
                <Text className="font-Poppins_500Medium text-gray-light">
                  Be the first to comment!
                </Text>
              </View>
            )}
            ListHeaderComponent={
              <>
                <View className="w-full border-b border-gray-200">
                  <View className="mx-auto w-5/6 space-y-2 py-4">
                    <Text
                      className={clsx('font-Poppins_600SemiBold text-base', {
                        'font-Poppins_600SemiBold_Italic text-gray-light':
                          post.is_deleted || post.is_flagged
                      })}
                    >
                      {post.is_deleted
                        ? 'Deleted'
                        : post.is_flagged
                        ? 'Flagged'
                        : post.content}
                    </Text>

                    <View className="space-y-1">
                      <Text className="font-Poppins_500Medium text-gray-light">
                        by{' '}
                        <Text
                          className={clsx('font-Poppins_600SemiBold', {
                            'font-Poppins_600SemiBold_Italic text-gray-light':
                              post.is_deleted
                          })}
                        >
                          {post.is_deleted ? 'Deleted' : post.username}
                        </Text>{' '}
                        in{' '}
                        <Text className="font-Poppins_600SemiBold">
                          @{post.community_domain_name}
                        </Text>
                      </Text>

                      <View className="flex flex-row items-center space-x-2">
                        <Text className="font-Poppins_500Medium text-gray-light">
                          <FontAwesome5 name="arrow-up" size={14} />{' '}
                          {post.vote_count}
                        </Text>
                        <Text className="font-Poppins_500Medium text-gray-light">
                          <FontAwesome5 name="comment" size={14} />{' '}
                          {post.comment_count}
                        </Text>
                        <Text className="font-Poppins_500Medium text-gray-light">
                          <FontAwesome5 name="clock" size={14} />{' '}
                          {formatDuration(
                            Date.now() - post.created_at.getTime()
                          )}
                        </Text>
                        {post.is_private && (
                          <Text className="text-yellow-light">
                            <FontAwesome5 name="lock" size={14} />
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
                <View className="border-b border-gray-200">
                  <View className="mx-auto w-5/6 flex-row justify-between py-2">
                    <Pressable
                      className={clsx(
                        {
                          'bg-pink-light active:opacity-90':
                            post.current_user_vote === 'upvote',
                          'active:bg-gray-200':
                            post.current_user_vote !== 'upvote'
                        },
                        'rounded-lg p-2'
                      )}
                      onPress={() =>
                        handlePostVoteButtonPress({
                          postId: post.id,
                          oldVote: post.current_user_vote,
                          vote: 'upvote'
                        })
                      }
                    >
                      <Text
                        className={clsx({
                          'text-white': post.current_user_vote === 'upvote',
                          'text-gray-light': post.current_user_vote !== 'upvote'
                        })}
                      >
                        <FontAwesome5 name="arrow-up" size={18} />
                      </Text>
                    </Pressable>
                    <Pressable
                      className={clsx(
                        {
                          'bg-blue-light active:opacity-90':
                            post.current_user_vote === 'downvote',
                          'active:bg-gray-200':
                            post.current_user_vote !== 'downvote'
                        },
                        'rounded-lg p-2'
                      )}
                      onPress={() =>
                        handlePostVoteButtonPress({
                          postId: post.id,
                          oldVote: post.current_user_vote,
                          vote: 'downvote'
                        })
                      }
                    >
                      <Text
                        className={clsx({
                          'text-white': post.current_user_vote === 'downvote',
                          'text-gray-light':
                            post.current_user_vote !== 'downvote'
                        })}
                      >
                        <FontAwesome5 name="arrow-down" size={18} />
                      </Text>
                    </Pressable>
                    <Pressable
                      className="rounded-lg p-2 active:bg-gray-200"
                      onPress={handlePostReplyButtonPress}
                    >
                      <Text className="text-gray-light">
                        <FontAwesome5 name="comment" size={18} />
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            }
            renderItem={item => (
              <Comment
                commentCount={item.item.comment_count}
                communityDomainName={post.community_domain_name}
                content={item.item.content}
                createdAt={item.item.created_at}
                currentUserVote={item.item.current_user_vote}
                id={item.item.id}
                isAuthorInternal={item.item.is_author_internal}
                isDeleted={item.item.is_deleted}
                isFlagged={item.item.is_flagged}
                isPostPrivate={post.is_private}
                username={item.item.username}
                voteCount={item.item.vote_count}
                onReplyButtonPress={id => handleCommentReplyButtonPress(id)}
                onDownvoteButtonPress={() =>
                  handleCommentVoteButtonPress({
                    commentId: item.item.id,
                    oldVote: item.item.current_user_vote,
                    vote: 'downvote'
                  })
                }
                onEllipsisButtonPress={() =>
                  handleCommentEllipsisButtonPress(item.item)
                }
                onUpvoteButtonPress={() =>
                  handleCommentVoteButtonPress({
                    commentId: item.item.id,
                    oldVote: item.item.current_user_vote,
                    vote: 'upvote'
                  })
                }
              />
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.2}
            onRefresh={handleListRefresh}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
