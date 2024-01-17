import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Skeleton } from 'moti/skeleton'
import React, {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState
} from 'react'
import { Alert, Linking, Pressable, Text, View } from 'react-native'
import Popover from 'react-native-popover-view'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { POPOVER_VERTICAL_OFFSET } from '../constants/popover'
import { useCommunityMemberCount } from '../hooks/useCommunityMemberCount'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { FilterBy, SortBy } from '../types/post'
import { Button } from './Button'
import { Posts } from './Posts'

interface CommunityProps {
  domainName: string
  isForeign?: boolean
}

export const Community: FunctionComponent<CommunityProps> = memo(
  ({ domainName, isForeign = false }) => {
    const navigation = useNavigation()

    const { showActionSheetWithOptions } = useActionSheet()

    const [sortBy, setSortBy] = useState<SortBy>('hot')
    const [filterBy, setFilterBy] = useState<FilterBy>('all')

    const [arePostsInitialLoading, setArePostsInitialLoading] = useState(true)
    const [
      isCommunityMemberCountInitialLoading,
      setIsCommunityMemberCountInitialLoading
    ] = useState(true)

    const {
      data: postsData,
      isFetching: arePostsFetching,
      refetch: refetchPosts,
      fetchNextPage: fetchPostsNextPage,
      hasNextPage: hasPostsNextPage,
      isFetchingNextPage: arePostsFetchingNextPage
    } = useCommunityPosts({ communityDomainName: domainName, sortBy, filterBy })

    const { refresh: refreshPosts, isRefreshing: arePostsRefreshing } =
      useUserRefresh(refetchPosts)

    const { data: memberCount, isFetching: isCommunityMemberCountFetching } =
      useCommunityMemberCount(domainName)

    const areResourcesInitialLoading =
      arePostsInitialLoading || isCommunityMemberCountInitialLoading

    useEffect(() => {
      if (!arePostsFetching) {
        setArePostsInitialLoading(false)
      }
    }, [arePostsFetching])

    useEffect(() => {
      if (!isCommunityMemberCountFetching) {
        setIsCommunityMemberCountInitialLoading(false)
      }
    }, [isCommunityMemberCountFetching])

    const handleBackButtonPress = useCallback(() => {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.navigate('Tabs')
      }
    }, [navigation])

    const handleCreatePostButtonPress = useCallback(() => {
      navigation.navigate('CreatePost', {
        initialIsPrivate: !isForeign,
        communityDomainName: domainName,
        isVisibilityChangeable: !isForeign
      })
    }, [domainName, isForeign, navigation])

    const handleFilterButtonPress = useCallback(() => {
      showActionSheetWithOptions(
        {
          title: 'Filter posts by',
          options: ['All', 'Public', 'Internal', 'Cancel'],
          cancelButtonIndex: 3
        },
        index => {
          if (index === 3) {
            return
          }

          switch (index) {
            case 0:
              setFilterBy('all')
              break
            case 1:
              setFilterBy('public')
              break
            case 2:
              setFilterBy('private')
              break
          }
        }
      )
    }, [setFilterBy, showActionSheetWithOptions])

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
              <Text className="font-Poppins_700Bold text-xl">
                @{domainName}
              </Text>
              {!isForeign && (
                <View>
                  <Popover
                    verticalOffset={POPOVER_VERTICAL_OFFSET}
                    from={
                      <Pressable className="h-6 w-6 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200">
                        <Text className="text-gray-600">
                          <FontAwesome5 name="question" size={12} />
                        </Text>
                      </Pressable>
                    }
                  >
                    <View className="space-y-2 p-4">
                      <Text className="font-Poppins_600SemiBold text-base">
                        What's this?
                      </Text>
                      <Text className="font-Poppins_500Medium">
                        This is your community! You were automatically added
                        since you signed up with a{' '}
                        <Text className="font-Poppins_600SemiBold">
                          @{domainName}
                        </Text>{' '}
                        email address.
                      </Text>
                      <Pressable
                        onPress={handleDomainNamePopoverLearnMorePress}
                      >
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
                  {`${memberCount} ${
                    (memberCount ?? 0) > 1 ? 'members' : 'member'
                  }`}
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
              {'  '}Post
            </Button>

            {isForeign ? (
              <Button
                className="h-10 flex-1"
                variant="secondary"
                onPress={handleBackButtonPress}
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

          <View className="w-full flex-1 border-t border-gray-100">
            <Posts
              fetchNextPage={fetchPostsNextPage}
              hasNextPage={hasPostsNextPage}
              isFetching={arePostsFetching}
              isFetchingNextPage={arePostsFetchingNextPage}
              isLoading={areResourcesInitialLoading}
              isRefreshing={arePostsRefreshing}
              posts={postsData?.pages.map(page => page.posts).flat(1)}
              shouldDisplayInternalPopover={!isForeign}
              sortBy={sortBy}
              sortPosts={setSortBy}
              onRefresh={refreshPosts}
            />
          </View>
        </View>
      </View>
    )
  }
)
