import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { Skeleton } from 'moti/skeleton'
import React, { FunctionComponent, useCallback } from 'react'
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native'
import Popover from 'react-native-popover-view'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useCommunityMemberCount } from '../hooks/useCommunityMemberCount'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
import { usePosts } from '../hooks/usePosts'
import { Button } from './Button'
import { Posts } from './Posts'

interface CommunityProps {
  domainName: string
  isForeign?: boolean
  onCreatePostButtonPress: (initialIsPrivate: boolean) => void
  onPostPress: (postId: number) => void
  onBackButtonPress?: () => void
}

export const Community: FunctionComponent<CommunityProps> = ({
  domainName,
  isForeign = false,
  onCreatePostButtonPress,
  onPostPress,
  onBackButtonPress
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const {
    posts,
    isInitialLoading: arePostsInitialLoading,
    sortBy,
    filterBy,
    sort: sortPosts,
    filter: filterPosts,
    refresh: refreshPosts,
    isRefreshing: arePostsRefreshing
  } = useCommunityPosts({ domainName })

  const {
    // posts,
    // isLoadingOnMount: arePostsLoadingOnMount,
    // isLoading: arePostsLoading,
    // sortBy,
    // sortPosts,
    // filterBy,
    // filterPosts,
    // refreshPosts,
    votePost
  } = usePosts({
    communityDomainName: domainName
  })

  const { memberCount, isLoading: isMemberCountLoading } =
    useCommunityMemberCount(domainName)

  const areResourcesInitialLoading =
    arePostsInitialLoading || isMemberCountLoading

  const handleCreatePostButtonPress = useCallback(() => {
    onCreatePostButtonPress(filterBy === 'private')
  }, [filterBy, onCreatePostButtonPress])

  const handleFilterButtonPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        title: 'Filter posts by',
        options: ['All', 'Public', 'Internal', 'Cancel'],
        cancelButtonIndex: 3
      },
      async index => {
        if (index === 3) {
          return
        }

        switch (index) {
          case 0:
            filterPosts('all')
            break
          case 1:
            filterPosts('public')
            break
          case 2:
            filterPosts('private')
            break
        }
      }
    )
  }, [filterPosts, showActionSheetWithOptions])

  const handleDomainNamePopoverLearnMorePress = useCallback(async () => {
    const url = 'https://yuzu.la/about'

    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url)
    } else {
      Sentry.Native.captureException(new Error('Could not open About page'))

      Alert.alert('Could not open About page', GENERIC_ERROR_MESSAGE)
    }
  }, [])

  return (
    <View className="w-full flex-1 pt-4">
      <View className="w-full flex-1 items-center justify-center space-y-4">
        <View className="w-5/6 space-y-2">
          <View className="flex flex-row items-center space-x-2">
            <Text className="font-Poppins_700Bold text-xl">@{domainName}</Text>
            {!isForeign && (
              <View>
                <Popover
                  from={
                    <Pressable className="h-6 w-6 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                      <Text className="text-gray-600">
                        <FontAwesome5 name="question" size={12} />
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
                      What's this?
                    </Text>
                    <Text className="font-Poppins_500Medium">
                      This is your community! You were automatically added since
                      you signed up with a{' '}
                      <Text className="font-Poppins_600SemiBold">
                        @{domainName}
                      </Text>{' '}
                      email address.
                    </Text>
                    <Pressable onPress={handleDomainNamePopoverLearnMorePress}>
                      <Text className="font-Poppins_500Medium text-blue-light">
                        Learn more
                      </Text>
                    </Pressable>
                  </View>
                </Popover>
              </View>
            )}
          </View>
          <View>
            <Skeleton colorMode="light" show={areResourcesInitialLoading}>
              <Text className="font-Poppins_600SemiBold text-gray-light">
                {`${memberCount} ${memberCount > 1 ? 'members' : 'member'}`}
              </Text>
            </Skeleton>
          </View>
        </View>

        <View className="flex w-5/6 flex-row space-x-2">
          <Button className="h-10 flex-1" onPress={handleCreatePostButtonPress}>
            <FontAwesome5 name="pen" />
            {'  '}Post
          </Button>

          {isForeign ? (
            <Button
              className="h-10 flex-1"
              variant="secondary"
              onPress={onBackButtonPress}
            >
              <FontAwesome5 name="arrow-left" />
              {'  '}Back
            </Button>
          ) : (
            <Button
              className="h-10 flex-1"
              variant="secondary"
              onPress={handleFilterButtonPress}
            >
              <FontAwesome5 name="filter" />
              {'  '}Filter
            </Button>
          )}
        </View>

        <View className="w-full flex-1">
          <Posts
            isLoading={areResourcesInitialLoading}
            isRefreshing={arePostsRefreshing}
            posts={posts}
            refreshPosts={refreshPosts}
            shouldDisplayInternalPopover={!isForeign}
            sortBy={sortBy}
            sortPosts={sortPosts}
            votePost={votePost}
            onPostPress={onPostPress}
          />
        </View>
      </View>
    </View>
  )
}
