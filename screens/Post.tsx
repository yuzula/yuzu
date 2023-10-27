import { useActionSheet } from '@expo/react-native-action-sheet'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
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
import { z } from 'zod'

import Button from '../components/Button'
import Comment from '../components/Comment'
import {
  GENERIC_ACTION_ERROR_TITLE,
  GENERIC_ERROR_MESSAGE,
  GENERIC_ERROR_TITLE
} from '../constants/alert'
import { formatCount } from '../helpers/count'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import useAuth from '../hooks/useAuth'
import * as commentModel from '../models/comment'
import * as postModel from '../models/post'
import * as blockService from '../services/block'
import * as commentService from '../services/comment'
import * as postService from '../services/post'
import * as reportService from '../services/report'
import { RootStackScreenProps } from '../types'

const createCommentSchema = z.object({
  content: z.string().min(1).max(600)
})

type CreateCommentSchema = z.infer<typeof createCommentSchema>

const Post: FunctionComponent<RootStackScreenProps<'Post'>> = ({
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

  const { user } = useAuth()
  const [post, setPost] = useState<postModel.Schema>()
  const [comments, setComments] = useState<commentModel.Schema[]>()
  const [replyParentCommentId, setReplyParentCommentId] = useState<
    number | undefined
  >()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateCommentLoading, setIsCreateCommentLoading] = useState(false)

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Tabs')
    }
  }, [navigation])

  const getPost = useCallback(async () => {
    if (user) {
      try {
        setPost(await postService.get({ postId, userId: user.id }))
      } catch (error) {
        Alert.alert(GENERIC_ACTION_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [postId, user])

  const getComments = useCallback(async () => {
    if (user && post) {
      try {
        setComments(
          await commentService.getAllRoot({ postId: post.id, userId: user.id })
        )
      } catch (error) {
        Alert.alert(GENERIC_ACTION_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [post, user])

  const handlePostVoteButtonPress = useCallback(
    async (postId: number, userId: string, vote: 'upvote' | 'downvote') => {
      if (post) {
        const newPost = { ...post }

        if (!newPost) {
          return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }

        const oldVote = newPost.current_user_vote

        const resultingVote = getResultingVote({
          oldVote,
          vote
        })

        newPost.current_user_vote = resultingVote.newVote
        newPost.vote_count += resultingVote.delta

        setPost(newPost)

        await postService.registerVote({
          postId,
          userId,
          oldVote,
          vote
        })
      }
    },
    [post]
  )

  const handleBlockAuthorButtonPress = useCallback(
    async (authorId: string) => {
      try {
        if (user && post) {
          await blockService.blockUser({
            blockerId: user.id,
            blockeeId: authorId
          })

          if (authorId === post.user_id) {
            navigation.navigate('Tabs', {
              screen: 'Home',
              params: { shouldRefresh: true }
            })
          } else {
            await getPost()
            await getComments()
          }
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [getComments, getPost, navigation, post, user]
  )

  const handleReportPostButtonPress = useCallback(
    async (post: postModel.Schema) => {
      try {
        if (user) {
          await reportService.reportPost(post.id)

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
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress, user]
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
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress, user]
  )

  const handlePostEllipsisButtonPress = useCallback(() => {
    if (post) {
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
            await handleReportPostButtonPress(post)
          } else if (index === 1 && post.user_id) {
            await handleBlockAuthorButtonPress(post.user_id)
          }
        }
      )
    } else {
      Alert.alert('Could not get post details', GENERIC_ERROR_MESSAGE)
    }
  }, [
    handleBlockAuthorButtonPress,
    handleReportPostButtonPress,
    post,
    showActionSheetWithOptions
  ])

  const handleCommentEllipsisButtonPress = useCallback(
    (comment: commentModel.BaseSchema) => {
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
    },
    [
      handleBlockAuthorButtonPress,
      handleReportCommentButtonPress,
      showActionSheetWithOptions
    ]
  )

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)

    await getPost()
    await getComments()

    setIsRefreshing(false)
  }, [getComments, getPost])

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
          await getPost()
          await getComments()
        } catch (error) {
          Alert.alert(GENERIC_ACTION_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        } finally {
          reset()

          setIsCreateCommentLoading(false)
        }
      }
    },
    [getComments, getPost, post, replyParentCommentId, reset, user]
  )

  const handleCommentVoteButtonPress = useCallback(
    async ({
      commentId,
      userId,
      parentCommentId,
      vote
    }: {
      commentId: number
      userId: string
      parentCommentId: number | null
      vote: 'upvote' | 'downvote'
    }) => {
      if (comments) {
        const newComments = [...comments]

        const newComment = parentCommentId
          ? newComments
              .find(comment => comment.id === parentCommentId)
              ?.children.find(comment => comment.id === commentId)
          : newComments.find(comment => comment.id === commentId)

        if (!newComment) {
          return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }

        const oldVote = newComment.current_user_vote

        const resultingVote = getResultingVote({
          oldVote,
          vote
        })

        newComment.current_user_vote = resultingVote.newVote
        newComment.vote_count += resultingVote.delta

        setComments(newComments)

        await commentService.registerVote({
          commentId,
          userId,
          oldVote,
          vote
        })
      }
    },
    [comments]
  )

  const handleCommentReplyButtonPress = useCallback((commentId: number) => {
    setReplyParentCommentId(commentId)

    replyTextFieldRef.current?.focus()
  }, [])

  const handleReplyButtonPress = useCallback(() => {
    setReplyParentCommentId(undefined)

    replyTextFieldRef.current?.focus()
  }, [])

  useEffect(() => {
    getPost()
  }, [getPost])

  useEffect(() => {
    getComments()
  }, [getComments])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      {!post || !user || !comments ? (
        <ActivityIndicator />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full flex-1"
        >
          <View className="flex-row items-center justify-between border-b border-gray-200 py-2">
            <View className="basis-1/3 items-start pl-2">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-lg active:bg-gray-200"
                onPress={handleBackButtonPress}
              >
                <Text className="text-apple-gray-light">
                  <FontAwesome5 name="chevron-left" size={16} />
                </Text>
              </Pressable>
            </View>
            <Text className="basis-1/3 text-center font-Poppins_600SemiBold">
              {formatCount(post.comment_count)} Comments
            </Text>
            <View className="basis-1/3 items-end pr-2">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-lg active:bg-gray-200"
                onPress={handlePostEllipsisButtonPress}
              >
                <Text className="text-apple-gray-light">
                  <FontAwesome5 name="ellipsis-h" size={16} />
                </Text>
              </Pressable>
            </View>
          </View>

          <FlatList
            className="w-full grow"
            data={comments}
            keyExtractor={item => item.id.toString()}
            keyboardDismissMode="interactive"
            refreshing={isRefreshing}
            ItemSeparatorComponent={() => (
              <View className="w-full border-t border-gray-200" />
            )}
            ListHeaderComponent={
              <>
                <View className="w-full border-b border-gray-200">
                  <View className="mx-auto w-5/6 space-y-2 py-4">
                    <Text className="font-Poppins_500Medium text-base">
                      {post.content}
                    </Text>

                    <View className="space-y-1">
                      <Text className="font-Poppins_400Regular text-apple-gray-light">
                        by&nbsp;
                        <Text className="font-Poppins_500Medium">
                          {post.username}
                        </Text>
                      </Text>
                      <View className="flex flex-row space-x-2">
                        <View>
                          <Text className="font-Poppins_400Regular text-apple-gray-light">
                            <AntDesign name="arrowup" size={14} />
                            &nbsp;{post.vote_count}
                          </Text>
                        </View>
                        <View>
                          <Text className="font-Poppins_400Regular text-apple-gray-light">
                            <AntDesign name="message1" size={14} />
                            &nbsp;{post.comment_count}
                          </Text>
                        </View>
                        <View>
                          <Text className="font-Poppins_400Regular text-apple-gray-light">
                            <AntDesign name="clockcircleo" size={14} />
                            &nbsp;
                            {formatDuration(
                              Date.now() - post.created_at.getTime()
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="border-b border-gray-200">
                  <View className="mx-auto w-5/6 flex-row justify-between py-2">
                    <Pressable
                      className={clsx(
                        {
                          'bg-primary active:bg-primary-darker':
                            post.current_user_vote === 'upvote',
                          'active:bg-gray-200':
                            post.current_user_vote !== 'upvote'
                        },
                        'rounded-lg p-2'
                      )}
                      onPress={() =>
                        handlePostVoteButtonPress(post.id, user.id, 'upvote')
                      }
                    >
                      <Text
                        className={clsx({
                          'text-black': post.current_user_vote === 'upvote',
                          'text-apple-gray-light':
                            post.current_user_vote !== 'upvote'
                        })}
                      >
                        <AntDesign name="arrowup" size={20} />
                      </Text>
                    </Pressable>
                    <Pressable
                      className={clsx(
                        {
                          'bg-apple-blue-light active:opacity-90':
                            post.current_user_vote === 'downvote',
                          'active:bg-gray-200':
                            post.current_user_vote !== 'downvote'
                        },
                        'rounded-lg p-2'
                      )}
                      onPress={() =>
                        handlePostVoteButtonPress(post.id, user.id, 'downvote')
                      }
                    >
                      <Text
                        className={clsx({
                          'text-white': post.current_user_vote === 'downvote',
                          'text-apple-gray-light':
                            post.current_user_vote !== 'downvote'
                        })}
                      >
                        <AntDesign name="arrowdown" size={20} />
                      </Text>
                    </Pressable>
                    <Pressable
                      className="rounded-lg p-2 active:bg-gray-200"
                      onPress={handleReplyButtonPress}
                    >
                      <Text className="text-apple-gray-light">
                        <AntDesign name="message1" size={20} />
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            }
            renderItem={item => (
              <FlatList
                data={item.item.children}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => (
                  <View className="w-full border-t border-gray-200" />
                )}
                ListHeaderComponent={() => (
                  <Comment
                    content={item.item.content}
                    createdAt={item.item.created_at}
                    currentUserVote={item.item.current_user_vote}
                    id={item.item.id}
                    isCurrentUserAuthor={item.item.user_id === user.id}
                    isDeleted={item.item.is_deleted}
                    username={item.item.username}
                    voteCount={item.item.vote_count}
                    onReplyButtonPress={id => handleCommentReplyButtonPress(id)}
                    onDownvoteButtonPress={() =>
                      handleCommentVoteButtonPress({
                        commentId: item.item.id,
                        userId: user.id,
                        vote: 'downvote',
                        parentCommentId: item.item.parent_comment_id
                      })
                    }
                    onEllipsisButtonPress={() =>
                      handleCommentEllipsisButtonPress(item.item)
                    }
                    onUpvoteButtonPress={() =>
                      handleCommentVoteButtonPress({
                        commentId: item.item.id,
                        userId: user.id,
                        vote: 'upvote',
                        parentCommentId: item.item.parent_comment_id
                      })
                    }
                  />
                )}
                renderItem={item => (
                  <Comment
                    content={item.item.content}
                    createdAt={item.item.created_at}
                    currentUserVote={item.item.current_user_vote}
                    id={item.item.id}
                    isCurrentUserAuthor={item.item.user_id === user.id}
                    isDeleted={item.item.is_deleted}
                    username={item.item.username}
                    variant="child"
                    voteCount={item.item.vote_count}
                    onDownvoteButtonPress={() =>
                      handleCommentVoteButtonPress({
                        commentId: item.item.id,
                        userId: user.id,
                        vote: 'downvote',
                        parentCommentId: item.item.parent_comment_id
                      })
                    }
                    onEllipsisButtonPress={() =>
                      handleCommentEllipsisButtonPress(item.item)
                    }
                    onUpvoteButtonPress={() =>
                      handleCommentVoteButtonPress({
                        commentId: item.item.id,
                        userId: user.id,
                        vote: 'upvote',
                        parentCommentId: item.item.parent_comment_id
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
                <Text className="font-Poppins_400Regular">
                  Replying to&nbsp;
                  <Text className="font-Poppins_500Medium">
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
                    className="max-h-44 basis-9/12 rounded-xl bg-gray-100 p-2 font-Poppins_400Regular"
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

export default Post
