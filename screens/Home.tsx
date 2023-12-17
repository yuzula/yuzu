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
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { usePosts } from '../hooks/usePosts'
import { useProfileContext } from '../hooks/useProfileContext'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { RootTabScreenProps } from '../types'
import { SortBy } from '../types/post'

export const Home: FunctionComponent<RootTabScreenProps<'Home'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets()

  const { profile } = useProfileContext()

  const [sortBy, setSortBy] = useState<SortBy>('hot')

  const [arePostsInitialLoading, setArePostsInitialLoading] = useState(true)

  const {
    data: postsData,
    isFetching: arePostsFetching,
    refetch: refetchPosts,
    fetchNextPage: fetchPostsNextPage,
    hasNextPage: hasPostsNextPage,
    isFetchingNextPage: arePostsFetchingNextPage
  } = usePosts({ variables: { sortBy, filterBy: 'all' } })

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
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <View className="py-4">
        <Text className="font-Poppins_700Bold text-xl">Home</Text>
      </View>

      <View className="w-full flex-1">
        <Posts
          shouldDisplayCommunityDomainName
          fetchNextPage={fetchPostsNextPage}
          hasNextPage={hasPostsNextPage}
          isFetching={arePostsFetching}
          isFetchingNextPage={arePostsFetchingNextPage}
          isLoading={arePostsInitialLoading}
          isRefreshing={arePostsRefreshing}
          posts={postsData?.pages.flat(1)}
          refreshPosts={refreshPosts}
          sortBy={sortBy}
          sortPosts={setSortBy}
          onPostCommunityDomainNamePress={handlePostCommunityDomainNamePress}
          onPostPress={handlePostPress}
        />
      </View>
    </View>
  )
}
