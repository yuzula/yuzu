import React, { FunctionComponent, useCallback } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Posts } from '../components/Posts'
import { usePosts } from '../hooks/usePosts'
import { RootTabScreenProps } from '../types'

export const Home: FunctionComponent<RootTabScreenProps<'Home'>> = ({
  navigation
}) => {
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
          onPostPress={handlePostPress}
        />
      </View>
    </SafeAreaView>
  )
}
