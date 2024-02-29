import { FontAwesome5 } from '@expo/vector-icons'
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  View
} from 'react-native'
import Popover from 'react-native-popover-view'

import { POPOVER_VERTICAL_OFFSET } from '../constants/popover'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { postModel } from '../models/post'
import { SortBy } from '../types/post'
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
    const { profile } = useAuthenticatedProfile()

    const renderListItem = useCallback(
      ({ item: post }: ListRenderItemInfo<postModel.Schema>) => (
        <Post
          post={post}
          shouldDisplayCommunityDomainName={shouldDisplayCommunityDomainName}
          onCommunityDomainNamePress={onPostCommunityDomainNamePress}
        />
      ),
      [onPostCommunityDomainNamePress, shouldDisplayCommunityDomainName]
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
                <View className="gap-y-2 p-4">
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
