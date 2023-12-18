import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import * as Haptics from 'expo-haptics'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { Button } from '../components/Button'
import { Comment } from '../components/Comment'
import { Separator } from '../components/Separator'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { useAuthContext } from '../hooks/useAuthContext'
import { useBlockUser } from '../hooks/useBlockUser'
import { useComments } from '../hooks/useComments'
import { useDeletePost } from '../hooks/useDeletePost'
import { usePost } from '../hooks/usePost'
import { useReportPost } from '../hooks/useReportPost'
import { useVotePost } from '../hooks/useVotePost'
import { commentModel } from '../models/comment'
import { postModel } from '../models/post'
import { commentService } from '../services/comment'
import { reportService } from '../services/report'
import { RootStackScreenProps } from '../types'
import { Vote } from '../types/vote'

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(600)
})

type CreateCommentSchema = z.infer<typeof createCommentSchema>

export const Post: FunctionComponent<RootStackScreenProps<'Post'>> = ({
  navigation,
  route: {
    params: { postId }
  }
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset
  } = useForm<CreateCommentSchema>({
    mode: 'all',
    resolver: zodResolver(createCommentSchema)
  })

  const { showActionSheetWithOptions } = useActionSheet()

  const replyTextFieldRef = useRef<TextInput>(null)

  const { user } = useAuthContext()

  const {
    post,
    error: postError,
    refresh: refreshPost,
    isRefreshing: isPostRefreshing
  } = usePost(postId)

  const { votePost, error: votePostError } = useVotePost()

  const { mutate: deletePost, error: deletePostError } = useDeletePost()

  const { mutate: blockUser, error: blockUserError } = useBlockUser()

  const { mutate: reportPost, error: reportPostError } = useReportPost()

  const {
    comments,
    getComments,
    refreshComments,
    voteComment,
    isRefreshing: areCommentsRefreshing,
    isLoadingOnMount: areCommentsLoadingOnMount
  } = useComments(postId)

  const [replyParentCommentId, setReplyParentCommentId] = useState<
    number | undefined
  >()
  const [isCreateCommentLoading, setIsCreateCommentLoading] = useState(false)

  useEffect(() => {
    if (postError) {
      Alert.alert('Could not fetch post', GENERIC_ERROR_MESSAGE)
    }
  }, [postError])

  useEffect(() => {
    if (votePostError) {
      Alert.alert('Could not vote on post', GENERIC_ERROR_MESSAGE)
    }
  }, [votePostError])

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
        if (user && post) {
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
    [blockUser, navigation, post, user]
  )

  const handleReportPostButtonPress = useCallback(
    (post: postModel.Schema) => {
      try {
        if (user) {
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
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress, reportPost, user]
  )

  const handleReportCommentButtonPress = useCallback(
    async (comment: commentModel.BaseSchema) => {
      try {
        if (user) {
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
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress, user]
  )

  const handlePostEllipsisButtonPress = useCallback(() => {
    if (!user) {
      return Alert.alert('Could not get user details', GENERIC_ERROR_MESSAGE)
    }

    if (!post) {
      return Alert.alert('Could not get post details', GENERIC_ERROR_MESSAGE)
    }

    if (user.id === post.user_id) {
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
    showActionSheetWithOptions,
    user
  ])

  const handleCommentEllipsisButtonPress = useCallback(
    (comment: commentModel.BaseSchema) => {
      if (!user) {
        return Alert.alert(
          'Could not fetch user details',
          GENERIC_ERROR_MESSAGE
        )
      }

      if (user.id === comment.user_id) {
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

                      getComments()
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
      getComments,
      handleBlockAuthorButtonPress,
      handleReportCommentButtonPress,
      showActionSheetWithOptions,
      user
    ]
  )

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshPost(), refreshComments()])
  }, [refreshComments, refreshPost])

  const handleCreateCommentSendButtonPress = useCallback(
    async ({ content }: CreateCommentSchema) => {
      if (post && user) {
        setIsCreateCommentLoading(true)

        try {
          await commentService.create({
            postId: post.id,
            userId: user.id,
            content,
            parentCommentId: replyParentCommentId
          })

          await Promise.all([refreshPost(), getComments()])

          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          )
        } catch (error) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          )

          Sentry.Native.captureException(error)

          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        } finally {
          reset()

          setIsCreateCommentLoading(false)
        }
      } else {
        Sentry.Native.captureException(
          new Error('`post` and `user` are not defined when submitting comment')
        )
      }
    },
    [getComments, post, refreshPost, replyParentCommentId, reset, user]
  )

  const handleCommentReplyButtonPress = useCallback((commentId: number) => {
    setReplyParentCommentId(commentId)

    replyTextFieldRef.current?.focus()
  }, [])

  const handleReplyButtonPress = useCallback(() => {
    setReplyParentCommentId(undefined)

    replyTextFieldRef.current?.focus()
  }, [])

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

      await votePost({ postId, vote: newVote, delta })
    },
    [votePost]
  )

  const handleCommentVoteButtonPress = useCallback(
    async ({
      commentId,
      parentCommentId,
      oldVote,
      vote
    }: {
      commentId: number
      parentCommentId?: number
      oldVote?: Vote
      vote: Vote
    }) => {
      const { newVote, delta } = getResultingVote({ oldVote, vote })

      await voteComment({ commentId, parentCommentId, vote: newVote, delta })
    },
    [voteComment]
  )

  if (!user) {
    return null
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      {!post || !comments || areCommentsLoadingOnMount ? (
        <ActivityIndicator />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full flex-1"
        >
          <View className="border-b border-gray-100">
            <View className="flex-row items-center justify-between px-3 py-2">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-lg active:bg-gray-200"
                onPress={handleBackButtonPress}
              >
                <Text className="text-gray-light">
                  <FontAwesome5 name="chevron-left" size={16} />
                </Text>
              </Pressable>
              <Text
                className="shrink text-center font-Poppins_700Bold text-base"
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                @{post.community_domain_name}
              </Text>
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-lg active:bg-gray-200"
                onPress={handlePostEllipsisButtonPress}
              >
                <Text className="text-gray-light">
                  <FontAwesome5 name="ellipsis-h" size={16} />
                </Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            ItemSeparatorComponent={Separator}
            className="w-full"
            contentContainerStyle={{ flexGrow: 1 }}
            data={comments}
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
                        </Text>
                      </Text>
                      <View className="flex flex-row items-center space-x-2">
                        <Text className="font-Poppins_500Medium text-gray-light">
                          <FontAwesome5 name="arrow-up" size={14} />{' '}
                          {post.vote_count}
                        </Text>
                        <Text className="font-Poppins_500Medium text-gray-light">
                          <FontAwesome5 name="comment-dots" size={14} />{' '}
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
                      onPress={handleReplyButtonPress}
                    >
                      <Text className="text-gray-light">
                        <FontAwesome5 name="comment-dots" size={18} />
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            }
            // TODO: refactor this into a useCallback
            renderItem={item => (
              <FlatList
                ItemSeparatorComponent={Separator}
                data={item.item.children}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                ListHeaderComponent={() => (
                  <Comment
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
                        parentCommentId: item.item.parent_comment_id,
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
                        parentCommentId: item.item.parent_comment_id,
                        oldVote: item.item.current_user_vote,
                        vote: 'upvote'
                      })
                    }
                  />
                )}
                renderItem={item => (
                  <Comment
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
                    variant="child"
                    voteCount={item.item.vote_count}
                    onDownvoteButtonPress={() =>
                      handleCommentVoteButtonPress({
                        commentId: item.item.id,
                        parentCommentId: item.item.parent_comment_id,
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
                        parentCommentId: item.item.parent_comment_id,
                        oldVote: item.item.current_user_vote,
                        vote: 'upvote'
                      })
                    }
                  />
                )}
              />
            )}
            onRefresh={handleRefresh}
          />

          <View className="space-y-2 border-t border-gray-200 py-2">
            {replyParentCommentId && (
              <View className="mx-auto w-5/6">
                <Text className="font-Poppins_500Medium">
                  Replying to{' '}
                  <Text className="font-Poppins_600SemiBold">
                    {
                      comments.find(
                        comment => comment.id === replyParentCommentId
                      )?.username
                    }
                  </Text>
                </Text>
              </View>
            )}

            <View className="mx-auto w-5/6 flex-row space-x-2">
              <Controller
                control={control}
                name="content"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={replyTextFieldRef}
                    multiline
                    className="max-h-44 basis-9/12 rounded-xl bg-gray-100 p-2 font-Poppins_500Medium"
                    editable={!isCreateCommentLoading}
                    maxLength={600}
                    placeholder="Add a comment"
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      setReplyParentCommentId(undefined)
                      onBlur()
                    }}
                  />
                )}
              />
              <Button
                className="basis-3/12"
                isDisabled={!isValid}
                isFixedHeight={false}
                isLoading={isCreateCommentLoading}
                onPress={handleSubmit(handleCreateCommentSendButtonPress)}
              >
                Send
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}
