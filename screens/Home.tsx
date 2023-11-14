import React, { FunctionComponent, useCallback } from 'react'
import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Posts } from '../components/Posts'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { usePosts } from '../hooks/usePosts'
import { useProfileContext } from '../hooks/useProfileContext'
import { RootTabScreenProps } from '../types'

export const Home: FunctionComponent<RootTabScreenProps<'Home'>> = ({
  navigation
}) => {
  const { profile } = useProfileContext()

  const {
    posts,
    isLoadingOnMount: arePostsLoadingOnMount,
    isLoading: arePostsLoading,
    sortBy,
    sortPosts,
    refreshPosts,
    votePost
  } = usePosts()

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  const handlePostCommunityDomainNamePress = useCallback(
    (domainName: string) => {
      if (!profile) {
        Sentry.Native.captureException('Profile is not defined')

        return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }

      if (profile.community_domain_name === domainName) {
        navigation.navigate('Tabs', { screen: 'Community' })
      } else {
        navigation.navigate('ForeignCommunity', { domainName })
      }
    },
    [navigation, profile]
  )

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <View className="py-4">
        <Text className="font-Poppins_700Bold text-xl">Home</Text>
      </View>

      <View className="w-full flex-1">
        <Posts
          shouldDisplayCommunityDomainName
          isLoading={arePostsLoadingOnMount}
          isRefreshing={arePostsLoading}
          posts={posts}
          refreshPosts={refreshPosts}
          sortBy={sortBy}
          sortPosts={sortPosts}
          votePost={votePost}
          onPostCommunityDomainNamePress={handlePostCommunityDomainNamePress}
          onPostPress={handlePostPress}
        />
      </View>
    </SafeAreaView>
  )
}
