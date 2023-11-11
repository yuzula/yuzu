import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import { Skeleton } from 'moti/skeleton'
import React, { FunctionComponent, useCallback } from 'react'
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native'
import Popover from 'react-native-popover-view'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { retryPromise } from '../helpers/promise'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { useAuthContext } from '../hooks/useAuthContext'
import { useProfileContext } from '../hooks/useProfileContext'
import { postModel } from '../models/post'
import { blockService } from '../services/block'
import { postService } from '../services/post'
import { reportService } from '../services/report'
import { SortBy } from '../types/post'
import { Vote } from '../types/vote'
import { Separator } from './Separator'
import { SortByButton } from './SortByButton'

interface PostsProps {
  posts: postModel.Schema[]
  isRefreshing: boolean
  isLoading: boolean
  sortBy: SortBy
  votePost: (params: {
    postId: number
    vote?: Vote
    delta: number
  }) => Promise<void>
  refreshPosts: () => Promise<void>
  sortPosts: (sortBy: SortBy) => Promise<void>
  onPostPress: (post: postModel.Schema) => void
}

export const Posts: FunctionComponent<PostsProps> = ({
  posts,
  isRefreshing,
  isLoading,
  sortBy,
  votePost,
  sortPosts,
  refreshPosts,
  onPostPress
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const { user } = useAuthContext()
  const { profile } = useProfileContext()

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

  const handleBlockAuthorButtonPress = useCallback(
    async (authorId: string) => {
      try {
        if (user) {
          await retryPromise(() =>
            blockService.blockUser({
              blockerId: user.id,
              blockeeId: authorId
            })
          )

          await refreshPosts()
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [refreshPosts, user]
  )

  const handleReportPostButtonPress = useCallback(
    async (post: postModel.Schema) => {
      try {
        if (user) {
          await retryPromise(() => reportService.reportPost(post.id))

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
    [handleBlockAuthorButtonPress, user]
  )

  const handlePostEllipsisButtonPress = useCallback(
    (post: postModel.Schema) => {
      if (!user) {
        return Alert.alert(
          'Could not fetch user details',
          GENERIC_ERROR_MESSAGE
        )
      }

      if (user.id === post.user_id) {
        showActionSheetWithOptions(
          {
            title: 'More actions',
            options: ['Delete this post', 'Cancel'],
            destructiveButtonIndex: 0,
            cancelButtonIndex: 1
          },
          async index => {
            if (index === 1) {
              return
            }

            Alert.alert(
              'Are you sure you want to delete this post?',
              undefined,
              [
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await postService.markAsDeleted(post.id)

                      refreshPosts()
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
      }
    },
    [
      handleBlockAuthorButtonPress,
      handleReportPostButtonPress,
      refreshPosts,
      showActionSheetWithOptions,
      user
    ]
  )

  if (!user || !profile) {
    return null
  }

  return isLoading ? (
    <View className="w-full grow">
      {[...Array(4).keys()].map(i => (
        <View key={i} className="mx-auto w-5/6 space-y-2 py-4">
          <View>
            <Skeleton colorMode="light" radius="round" />
          </View>
          <View>
            <Skeleton colorMode="light" height={10} width="60%" />
          </View>
          <View>
            <Skeleton colorMode="light" height={10} width="80%" />
          </View>
          <View>
            <Skeleton colorMode="light" height={10} width="90%" />
          </View>
        </View>
      ))}
    </View>
  ) : (
    <FlatList
      ItemSeparatorComponent={Separator}
      className="w-full border-t border-gray-100"
      contentContainerStyle={{ flexGrow: 1 }}
      data={posts}
      keyExtractor={item => item.id.toString()}
      refreshing={isRefreshing}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center">
          <Text className="font-Poppins_600SemiBold text-base text-gray-light">
            No posts yet
          </Text>
          <Text className="font-Poppins_500Medium text-gray-light">
            Be the first to post!
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <View className="bg-gray-100 py-4">
          <View className="mx-auto flex w-5/6 flex-row justify-between">
            <SortByButton sortBy={sortBy} onChange={sortPosts} />
            <Popover
              from={
                <Pressable>
                  <Text className="font-Poppins_600SemiBold text-gray-light">
                    What's&nbsp;&nbsp;
                    <FontAwesome5 name="lock" />
                    &nbsp;?
                  </Text>
                </Pressable>
              }
              verticalOffset={
                Platform.OS === 'android' && StatusBar.currentHeight
                  ? -StatusBar.currentHeight
                  : 0
              }
            >
              <View className="space-y-2 p-4">
                <Text className="font-Poppins_600SemiBold text-base">
                  Internal posts
                </Text>
                <Text className="font-Poppins_500Medium">
                  Internal posts can only be created and viewed by your peers
                  that also signed up with a&nbsp;
                  <Text className="font-Poppins_600SemiBold">
                    @{profile.community_domain_name}
                  </Text>
                  &nbsp;email address.
                </Text>
                <Text className="font-Poppins_500Medium">
                  They are marked with the special&nbsp;&nbsp;
                  <Text className="text-yellow-light">
                    <FontAwesome5 name="lock" />
                  </Text>
                  &nbsp;&nbsp;icon.
                </Text>
                <Text className="font-Poppins_500Medium">
                  Public posts don't have that icon and can be created & viewed
                  by everyone.
                </Text>
              </View>
            </Popover>
          </View>
        </View>
      }
      renderItem={item => (
        <Pressable
          className="active:bg-gray-200"
          onPress={() => onPostPress(item.item)}
        >
          <View className="mx-auto w-5/6 space-y-2 py-4">
            <Text
              ellipsizeMode="tail"
              numberOfLines={4}
              className={clsx('font-Poppins_600SemiBold text-base', {
                'font-Poppins_600SemiBold_Italic text-gray-light':
                  item.item.is_deleted || item.item.is_flagged
              })}
            >
              {item.item.is_deleted
                ? 'Deleted'
                : item.item.is_flagged
                ? 'Flagged'
                : item.item.content}
            </Text>

            <View className="flex flex-row items-center justify-between">
              <View className="space-y-1">
                <Text className="font-Poppins_500Medium text-gray-light">
                  by&nbsp;
                  <Text
                    className={clsx('font-Poppins_600SemiBold', {
                      'font-Poppins_600SemiBold_Italic': item.item.is_deleted
                    })}
                  >
                    {item.item.is_deleted ? 'Deleted' : item.item.username}
                  </Text>
                </Text>
                <View className="flex flex-row items-center space-x-2">
                  <Text className="font-Poppins_500Medium text-gray-light">
                    <FontAwesome5 name="arrow-up" size={14} />
                    &nbsp;{item.item.vote_count}
                  </Text>
                  <Text className="font-Poppins_500Medium text-gray-light">
                    <FontAwesome5 name="comment-dots" size={14} />
                    &nbsp;{item.item.comment_count}
                  </Text>
                  <Text className="font-Poppins_500Medium text-gray-light">
                    <FontAwesome5 name="clock" size={14} />
                    &nbsp;
                    {formatDuration(
                      Date.now() - item.item.created_at.getTime()
                    )}
                  </Text>
                  {item.item.is_private && (
                    <Text className="text-yellow-light">
                      <FontAwesome5 name="lock" size={14} />
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex flex-row items-center space-x-1">
                <Pressable
                  className="rounded-lg p-2 active:bg-gray-200"
                  onPress={() => handlePostEllipsisButtonPress(item.item)}
                >
                  <Text className="text-gray-light">
                    <FontAwesome5 name="ellipsis-h" size={18} />
                  </Text>
                </Pressable>
                <Pressable
                  className={clsx(
                    {
                      'bg-pink-light active:opacity-90':
                        item.item.current_user_vote === 'upvote',
                      'active:bg-gray-200':
                        item.item.current_user_vote !== 'upvote'
                    },
                    'rounded-lg p-2'
                  )}
                  onPress={() =>
                    handlePostVoteButtonPress({
                      postId: item.item.id,
                      oldVote: item.item.current_user_vote,
                      vote: 'upvote'
                    })
                  }
                >
                  <Text
                    className={clsx({
                      'text-white': item.item.current_user_vote === 'upvote',
                      'text-gray-light':
                        item.item.current_user_vote !== 'upvote'
                    })}
                  >
                    <FontAwesome5 name="arrow-up" size={18} />
                  </Text>
                </Pressable>
                <Pressable
                  className={clsx(
                    {
                      'bg-blue-light active:opacity-90':
                        item.item.current_user_vote === 'downvote',
                      'active:bg-gray-200':
                        item.item.current_user_vote !== 'downvote'
                    },
                    'rounded-lg p-2'
                  )}
                  onPress={() =>
                    handlePostVoteButtonPress({
                      postId: item.item.id,
                      oldVote: item.item.current_user_vote,
                      vote: 'downvote'
                    })
                  }
                >
                  <Text
                    className={clsx({
                      'text-white': item.item.current_user_vote === 'downvote',
                      'text-gray-light':
                        item.item.current_user_vote !== 'downvote'
                    })}
                  >
                    <FontAwesome5 name="arrow-down" size={18} />
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      )}
      onRefresh={refreshPosts}
    />
  )
}
