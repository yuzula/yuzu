import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import { Alert, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Posts } from '../components/Posts'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
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
    error: postsError,
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

  useEffect(() => {
    if (postsError) {
      Sentry.Native.captureException(postsError)

      Alert.alert('Could not fetch posts', GENERIC_ERROR_MESSAGE)
    }
  }, [postsError])

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
          onRefresh={refreshPosts}
        />
      </View>
    </View>
  )
}
