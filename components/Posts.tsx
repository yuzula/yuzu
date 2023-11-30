import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { Skeleton } from 'moti/skeleton'
import React, { FunctionComponent, useCallback } from 'react'
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native'
import Popover from 'react-native-popover-view'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { getResultingVote } from '../helpers/vote'
import { useAuthContext } from '../hooks/useAuthContext'
import { useProfileContext } from '../hooks/useProfileContext'
import { postModel } from '../models/post'
import { blockService } from '../services/block'
import { postService } from '../services/post'
import { reportService } from '../services/report'
import { SortBy } from '../types/post'
import { Vote } from '../types/vote'
import { Post } from './Post'
import { Separator } from './Separator'
import { SortByButton } from './SortByButton'

interface PostsProps {
  posts?: postModel.Schema[]
  isRefreshing: boolean
  isLoading: boolean
  sortBy: SortBy
  shouldDisplayCommunityDomainName?: boolean
  shouldDisplayInternalPopover?: boolean
  votePost: (params: {
    postId: number
    vote?: Vote
    delta: number
  }) => Promise<void>
  refreshPosts: () => void
  sortPosts: (sortBy: SortBy) => void
  onPostPress: (postId: number) => void
  onPostCommunityDomainNamePress?: (domainName: string) => void
}

export const Posts: FunctionComponent<PostsProps> = ({
  posts,
  isRefreshing,
  isLoading,
  sortBy,
  shouldDisplayCommunityDomainName = false,
  shouldDisplayInternalPopover = true,
  votePost,
  sortPosts,
  refreshPosts,
  onPostPress,
  onPostCommunityDomainNamePress
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
          await blockService.blockUser({
            blockerId: user.id,
            blockeeId: authorId
          })

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
    async ({
      postId,
      postAuthorId
    }: {
      postId: number
      postAuthorId?: string
    }) => {
      try {
        if (user) {
          await reportService.reportPost(postId)

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
                        if (postAuthorId) {
                          handleBlockAuthorButtonPress(postAuthorId)
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
    ({ postId, postAuthorId }: { postId: number; postAuthorId?: string }) => {
      if (!user) {
        return Alert.alert(
          'Could not fetch user details',
          GENERIC_ERROR_MESSAGE
        )
      }

      if (user.id === postAuthorId) {
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
                      await postService.markAsDeleted(postId)

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
              await handleReportPostButtonPress({ postId, postAuthorId })
            } else if (index === 1 && postAuthorId) {
              await handleBlockAuthorButtonPress(postAuthorId)
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

  const handleRenderItem = useCallback(
    (item: ListRenderItemInfo<postModel.Schema>) => (
      <Post
        authorId={item.item.user_id}
        authorUsername={item.item.username}
        commentCount={item.item.comment_count}
        content={item.item.content}
        createdAt={item.item.created_at}
        currentUserVote={item.item.current_user_vote}
        id={item.item.id}
        isDeleted={item.item.is_deleted}
        isFlagged={item.item.is_flagged}
        isPrivate={item.item.is_private}
        voteCount={item.item.vote_count}
        communityDomainName={
          shouldDisplayCommunityDomainName
            ? item.item.community_domain_name
            : undefined
        }
        onCommunityDomainNamePress={onPostCommunityDomainNamePress}
        onEllipsisButtonPress={handlePostEllipsisButtonPress}
        onPress={onPostPress}
        onVoteButtonPress={handlePostVoteButtonPress}
      />
    ),
    [
      handlePostEllipsisButtonPress,
      handlePostVoteButtonPress,
      onPostCommunityDomainNamePress,
      onPostPress,
      shouldDisplayCommunityDomainName
    ]
  )

  if (!user || !profile) {
    return null
  }

  return isLoading ? (
    <View className="w-full grow border-t border-gray-100">
      {[...Array(4).keys()].map(i => (
        <View key={i} className="mx-auto w-5/6 space-y-2 py-4">
          <View>
            <Skeleton colorMode="light" radius="round" />
          </View>
          <View>
            <Skeleton colorMode="light" height={12} width="60%" />
          </View>
          <View>
            <Skeleton colorMode="light" height={12} width="80%" />
          </View>
          <View>
            <Skeleton colorMode="light" height={12} width="90%" />
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
      renderItem={handleRenderItem}
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
            {shouldDisplayInternalPopover && (
              <Popover
                from={
                  <Pressable>
                    <Text className="font-Poppins_600SemiBold text-gray-light">
                      What's{'  '}
                      <FontAwesome5 name="lock" /> ?
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
                    Internal posts can only be created and viewed by members of
                    the{' '}
                    <Text className="font-Poppins_600SemiBold">
                      @{profile.community_domain_name}
                    </Text>{' '}
                    community.
                  </Text>
                  <Text className="font-Poppins_500Medium">
                    They are marked with the special{'  '}
                    <Text className="text-yellow-light">
                      <FontAwesome5 name="lock" />
                    </Text>
                    {'  '}icon.
                  </Text>
                  <Text className="font-Poppins_500Medium">
                    Public posts don't have that icon and can be created &
                    viewed by everyone.
                  </Text>
                </View>
              </Popover>
            )}
          </View>
        </View>
      }
      onRefresh={refreshPosts}
    />
  )
}
