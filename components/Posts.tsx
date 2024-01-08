import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import React, {
  FunctionComponent,
  memo,
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

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { POPOVER_VERTICAL_OFFSET } from '../constants/popover'
import { getResultingVote } from '../helpers/vote'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeletePost } from '../hooks/useDeletePost'
import { useReportPost } from '../hooks/useReportPost'
import { useVotePost } from '../hooks/useVotePost'
import { postModel } from '../models/post'
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
  sortPosts: (sortBy: SortBy) => void
  onRefresh: () => Promise<void>
  onPostCommunityDomainNamePress?: (domainName: string) => void
}

export const Posts: FunctionComponent<PostsProps> = memo(
  ({
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
    onRefresh,
    onPostCommunityDomainNamePress
  }) => {
    const { showActionSheetWithOptions } = useActionSheet()

    const { profile } = useAuthenticatedProfile()

    const { mutate: votePost, error: votePostError } = useVotePost()

    const { mutate: deletePost, error: deletePostError } = useDeletePost()

    const { mutate: blockUser, error: blockUserError } = useBlockUser()

    const { mutate: reportPost, error: reportPostError } = useReportPost()

    const handlePostVoteButtonPress = useCallback(
      ({
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

    const handleReportPostButtonPress = useCallback(
      ({ postId, postAuthorId }: { postId: number; postAuthorId?: string }) => {
        reportPost({ postId })

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
                        blockUser({ userId: postAuthorId })
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

    const handlePostEllipsisButtonPress = useCallback(
      ({ postId, postAuthorId }: { postId: number; postAuthorId?: string }) => {
        if (profile.id === postAuthorId) {
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
            index => {
              if (index === 2) {
                return
              }

              if (index === 0) {
                handleReportPostButtonPress({ postId, postAuthorId })
              } else if (index === 1 && postAuthorId) {
                blockUser({ userId: postAuthorId })
              }
            }
          )
        }
      },
      [
        blockUser,
        deletePost,
        handleReportPostButtonPress,
        profile.id,
        showActionSheetWithOptions
      ]
    )

    const renderListItem = useCallback(
      ({ item: post }: ListRenderItemInfo<postModel.Schema>) => (
        <Post
          post={post}
          shouldDisplayCommunityDomainName={shouldDisplayCommunityDomainName}
          onCommunityDomainNamePress={onPostCommunityDomainNamePress}
          onEllipsisButtonPress={handlePostEllipsisButtonPress}
          onVoteButtonPress={handlePostVoteButtonPress}
        />
      ),
      [
        handlePostEllipsisButtonPress,
        handlePostVoteButtonPress,
        onPostCommunityDomainNamePress,
        shouldDisplayCommunityDomainName
      ]
    )

    const renderListEmptyComponent = useCallback(
      () =>
        isFetching ? (
          <PostsSkeleton />
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
      ),
      [
        profile.community_domain_name,
        shouldDisplayInternalPopover,
        sortBy,
        sortPosts
      ]
    )

    const listKeyExtractor = useCallback(
      (post: postModel.Schema) => post.id.toString(),
      []
    )

    const renderListFooterComponent = useCallback(() => {
      if (isFetchingNextPage) {
        return <ActivityIndicator className="py-4" />
      }

      return null
    }, [isFetchingNextPage])

    const handleEndReached = useCallback(() => {
      if (!isFetching && hasNextPage) {
        fetchNextPage()
      }
    }, [fetchNextPage, hasNextPage, isFetching])

    const listContentContainerStyle = useMemo(() => ({ flexGrow: 1 }), [])

    return isLoading ? (
      <PostsSkeleton />
    ) : (
      <FlatList
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        ListHeaderComponent={renderListHeaderComponent}
        className="w-full"
        contentContainerStyle={listContentContainerStyle}
        data={posts}
        keyExtractor={listKeyExtractor}
        refreshing={isRefreshing}
        renderItem={renderListItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        onRefresh={onRefresh}
      />
    )
  }
)
