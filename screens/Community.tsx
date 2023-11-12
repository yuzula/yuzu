import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { Skeleton } from 'moti/skeleton'
import React, { FunctionComponent, useCallback, useEffect } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Button } from '../components/Button'
import { Posts } from '../components/Posts'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { useMemberCount } from '../hooks/useMemberCount'
import { usePosts } from '../hooks/usePosts'
import { useProfileContext } from '../hooks/useProfileContext'
import { RootTabScreenProps } from '../types'

export const Community: FunctionComponent<RootTabScreenProps<'Community'>> = ({
  navigation,
  route
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const { profile } = useProfileContext()

  const {
    posts,
    isLoadingOnMount: arePostsLoadingOnMount,
    isLoading: arePostsLoading,
    sortBy,
    sortPosts,
    filterBy,
    filterPosts,
    refreshPosts,
    votePost
  } = usePosts({
    communityDomainName: profile?.community_domain_name
  })

  const { memberCount, isLoading: isMemberCountLoading } = useMemberCount()

  const areResourcesLoadingOnMount =
    arePostsLoadingOnMount || isMemberCountLoading

  const handleCreatePostButtonPress = useCallback(() => {
    if (!profile) {
      Sentry.Native.captureException('Profile is not defined')

      return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    }

    navigation.navigate('CreatePost', {
      initialIsPrivate: filterBy === 'private',
      communityDomainName: profile.community_domain_name
    })
  }, [filterBy, navigation, profile])

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
            await filterPosts('all')
            break
          case 1:
            await filterPosts('public')
            break
          case 2:
            await filterPosts('private')
            break
        }
      }
    )
  }, [filterPosts, showActionSheetWithOptions])

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  const handleDomainNamePopoverLearnMorePress = useCallback(async () => {
    const url = 'https://yuzu.la/about'

    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url)
    } else {
      Sentry.Native.captureException(new Error('Could not open About page'))

      Alert.alert('Could not open About page', GENERIC_ERROR_MESSAGE)
    }
  }, [])

  useEffect(() => {
    if (route.params?.shouldRefresh) {
      refreshPosts()
    }
  }, [refreshPosts, route.params?.shouldRefresh])

  if (!profile) {
    return null
  }

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <View className="w-full flex-1 pt-4">
        <View className="w-full flex-1 items-center justify-center space-y-4">
          <View className="w-5/6 space-y-2">
            <View className="flex flex-row items-center space-x-2">
              <Text className="font-Poppins_700Bold text-xl">
                @{profile.community_domain_name}
              </Text>
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
                      you signed up with a&nbsp;
                      <Text className="font-Poppins_600SemiBold">
                        @{profile.community_domain_name}
                      </Text>
                      &nbsp;email address.
                    </Text>
                    <Pressable onPress={handleDomainNamePopoverLearnMorePress}>
                      <Text className="font-Poppins_500Medium text-blue-light">
                        Learn more
                      </Text>
                    </Pressable>
                  </View>
                </Popover>
              </View>
            </View>
            <View>
              <Skeleton colorMode="light" show={areResourcesLoadingOnMount}>
                <Text className="font-Poppins_600SemiBold text-gray-light">
                  {`${memberCount} ${memberCount > 1 ? 'members' : 'member'}`}
                </Text>
              </Skeleton>
            </View>
          </View>

          <View className="flex w-5/6 flex-row space-x-2">
            <Button
              className="h-10 flex-1"
              onPress={handleCreatePostButtonPress}
            >
              <FontAwesome5 name="pen" />
              &nbsp;&nbsp;Post
            </Button>
            <Button
              className="h-10 flex-1"
              variant="secondary"
              onPress={handleFilterButtonPress}
            >
              <FontAwesome5 name="filter" />
              &nbsp;&nbsp;Filter
            </Button>
          </View>

          <View className="w-full flex-1">
            <Posts
              isLoading={arePostsLoadingOnMount}
              isRefreshing={arePostsLoading}
              posts={posts}
              refreshPosts={refreshPosts}
              sortBy={sortBy}
              sortPosts={sortPosts}
              votePost={votePost}
              onPostPress={handlePostPress}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
