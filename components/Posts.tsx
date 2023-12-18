import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo
} from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  View
} from 'react-native'
import Popover from 'react-native-popover-view'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { POPOVER_VERTICAL_OFFSET } from '../constants/popover'
import { getResultingVote } from '../helpers/vote'
import { useAuthContext } from '../hooks/useAuthContext'
import { useDeletePost } from '../hooks/useDeletePost'
import { useProfileContext } from '../hooks/useProfileContext'
import { useVotePost } from '../hooks/useVotePost'
import { postModel } from '../models/post'
import { blockService } from '../services/block'
import { reportService } from '../services/report'
import { SortBy } from '../types/post'
import { Vote } from '../types/vote'
import { Post } from './Post'
import { PostsSkeleton } from './PostsSkeleton'
import { Separator } from './Separator'
import { SortByButton } from './SortByButton'

interface PostsProps {
  posts?: postModel.Schema[]
  isRefreshing: boolean
  isFetching: boolean
  isLoading: boolean
  fetchNextPage: () => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
  sortBy: SortBy
  shouldDisplayCommunityDomainName?: boolean
  shouldDisplayInternalPopover?: boolean
  refreshPosts: () => Promise<void>
  sortPosts: (sortBy: SortBy) => void
  onPostPress: (postId: number) => void
  onPostCommunityDomainNamePress?: (domainName: string) => void
}

export const Posts: FunctionComponent<PostsProps> = ({
  posts,
  isRefreshing,
  isFetching,
  isLoading,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  sortBy,
  shouldDisplayCommunityDomainName = false,
  shouldDisplayInternalPopover = true,
  sortPosts,
  refreshPosts,
  onPostPress,
  onPostCommunityDomainNamePress
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const { user } = useAuthContext()
  const { profile } = useProfileContext()

  const { votePost, error: votePostError } = useVotePost()

  const { mutate: deletePost, error: deletePostError } = useDeletePost()

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
                  onPress: () => {
                    deletePost({ postId })
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
      deletePost,
      handleBlockAuthorButtonPress,
      handleReportPostButtonPress,
      showActionSheetWithOptions,
      user
    ]
  )

  const renderListItem = useCallback(
    ({ item: post }: ListRenderItemInfo<postModel.Schema>) => (
      <Post
        authorId={post.user_id}
        authorUsername={post.username}
        commentCount={post.comment_count}
        content={post.content}
        createdAt={post.created_at}
        currentUserVote={post.current_user_vote}
        id={post.id}
        isDeleted={post.is_deleted}
        isFlagged={post.is_flagged}
        isPrivate={post.is_private}
        voteCount={post.vote_count}
        communityDomainName={
          shouldDisplayCommunityDomainName
            ? post.community_domain_name
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

  const renderListEmptyComponent = useCallback(
    () =>
      isFetching ? (
        <View className="w-full grow border-t border-gray-100">
          <PostsSkeleton />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-Poppins_600SemiBold text-base text-gray-light">
            No posts yet
          </Text>
          <Text className="font-Poppins_500Medium text-gray-light">
            Be the first to post!
          </Text>
        </View>
      ),
    [isFetching]
  )

  const renderListHeaderComponent = useCallback(
    () => (
      <View className="bg-gray-100 py-4">
        <View className="mx-auto flex w-5/6 flex-row justify-between">
          <SortByButton sortBy={sortBy} onChange={sortPosts} />
          {shouldDisplayInternalPopover && (
            <Popover
              verticalOffset={POPOVER_VERTICAL_OFFSET}
              from={
                <Pressable>
                  <Text className="font-Poppins_600SemiBold text-gray-light">
                    What's{'  '}
                    <FontAwesome5 name="lock" /> ?
                  </Text>
                </Pressable>
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
                    @{profile?.community_domain_name}
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
                  Public posts don't have that icon and can be created & viewed
                  by everyone.
                </Text>
              </View>
            </Popover>
          )}
        </View>
      </View>
    ),
    [
      profile?.community_domain_name,
      shouldDisplayInternalPopover,
      sortBy,
      sortPosts
    ]
  )

  const renderListFooterComponent = useCallback(() => {
    if (isFetchingNextPage) {
      return <ActivityIndicator className="py-4" />
    }

    return null
  }, [isFetchingNextPage])

  const handleOnEndReached = useCallback(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetching])

  const listContentContainerStyle = useMemo(() => ({ flexGrow: 1 }), [])

  if (!user || !profile) {
    return null
  }

  return isLoading ? (
    <View className="w-full grow border-t border-gray-100">
      <PostsSkeleton />
    </View>
  ) : (
    <FlatList
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={renderListEmptyComponent}
      ListFooterComponent={renderListFooterComponent}
      ListHeaderComponent={renderListHeaderComponent}
      className="w-full border-t border-gray-100"
      contentContainerStyle={listContentContainerStyle}
      data={posts}
      keyExtractor={item => item.id.toString()}
      refreshing={isRefreshing}
      renderItem={renderListItem}
      onEndReached={handleOnEndReached}
      onEndReachedThreshold={0.2}
      onRefresh={refreshPosts}
    />
  )
}
