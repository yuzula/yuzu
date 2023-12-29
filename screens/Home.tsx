import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Posts } from '../components/Posts'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { usePosts } from '../hooks/usePosts'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { RootTabScreenProps } from '../types'
import { SortBy } from '../types/post'

export const Home: FunctionComponent<RootTabScreenProps<'Home'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets()

  const { profile } = useAuthenticatedProfile()

  const [sortBy, setSortBy] = useState<SortBy>('hot')

  const [arePostsInitialLoading, setArePostsInitialLoading] = useState(true)

  const {
    data: postsData,
    isFetching: arePostsFetching,
    refetch: refetchPosts,
    fetchNextPage: fetchPostsNextPage,
    hasNextPage: hasPostsNextPage,
    isFetchingNextPage: arePostsFetchingNextPage
  } = usePosts({ sortBy, filterBy: 'all' })

  const { refresh: refreshPosts, isRefreshing: arePostsRefreshing } =
    useUserRefresh(refetchPosts)

  useEffect(() => {
    if (!arePostsFetching) {
      setArePostsInitialLoading(false)
    }
  }, [arePostsFetching])

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  const handlePostCommunityDomainNamePress = useCallback(
    (domainName: string) => {
      if (profile.community_domain_name === domainName) {
        navigation.navigate('Tabs', { screen: 'Community' })
      } else {
        navigation.navigate('ForeignCommunity', { domainName })
      }
    },
    [navigation, profile]
  )

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <View className="py-4">
        <Text className="font-Poppins_700Bold text-xl">Home</Text>
      </View>

      <View className="w-full flex-1 border-t border-gray-100">
        <Posts
          shouldDisplayCommunityDomainName
          fetchNextPage={fetchPostsNextPage}
          hasNextPage={hasPostsNextPage}
          isFetching={arePostsFetching}
          isFetchingNextPage={arePostsFetchingNextPage}
          isLoading={arePostsInitialLoading}
          isRefreshing={arePostsRefreshing}
          posts={postsData?.pages.map(page => page.posts).flat(1)}
          sortBy={sortBy}
          sortPosts={setSortBy}
          onPostCommunityDomainNamePress={handlePostCommunityDomainNamePress}
          onPostPress={handlePostPress}
          onRefresh={refreshPosts}
        />
      </View>
    </View>
  )
}
