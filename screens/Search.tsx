import { Skeleton } from 'moti/skeleton'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'
import { useDebounce } from 'usehooks-ts'

import { Separator } from '../components/Separator'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useSearchCommunities } from '../hooks/useSearchCommunities'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { communityModel } from '../models/community'
import { RootTabScreenProps } from '../navigation/types'

export const Search: FunctionComponent<RootTabScreenProps<'Search'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets()

  const { profile } = useAuthenticatedProfile()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  const [areCommunitiesInitialLoading, setAreCommunitiesInitialLoading] =
    useState(true)

  const {
    data: communitiesData,
    error: communitiesError,
    isFetching: areCommunitiesFetching,
    refetch: refetchCommunities,
    fetchNextPage: fetchCommunitiesNextPage,
    hasNextPage: hasCommunitiesNextPage,
    isFetchingNextPage: areCommunitiesFetchingNextPage
  } = useSearchCommunities({ query: debouncedQuery })

  const {
    refresh: refreshCommunities,
    isRefreshing: areCommunitiesRefreshing
  } = useUserRefresh(refetchCommunities)

  useEffect(() => {
    if (!areCommunitiesFetching) {
      setAreCommunitiesInitialLoading(false)
    }
  }, [areCommunitiesFetching])

  useEffect(() => {
    if (communitiesError) {
      Sentry.Native.captureException(communitiesError)

      Alert.alert('Could not fetch communities', GENERIC_ERROR_MESSAGE)
    }
  }, [communitiesError])

  const handleCommunityPress = useCallback(
    (domainName: string) => {
      if (profile.community_domain_name === domainName) {
        navigation.navigate('Tabs', { screen: 'Community' })
      } else {
        navigation.navigate('ForeignCommunity', { domainName })
      }
    },
    [navigation, profile]
  )

  const handleRenderCommunityItem = useCallback(
    ({ item: community }: ListRenderItemInfo<communityModel.Schema>) => (
      <Pressable
        className="active:bg-gray-200"
        onPress={() => handleCommunityPress(community.domain_name)}
      >
        <View className="mx-auto w-5/6 gap-y-2 py-4">
          <Text className="font-Poppins_600SemiBold text-base">
            @{community.domain_name}
          </Text>
          <Text className="font-Poppins_500Medium text-gray-light">
            {community.member_count} member
            {community.member_count > 1 ? 's' : null}
          </Text>
        </View>
      </Pressable>
    ),
    [handleCommunityPress]
  )

  const renderListFooterComponent = useCallback(() => {
    if (areCommunitiesFetchingNextPage) {
      return <ActivityIndicator className="py-4" />
    }

    return null
  }, [areCommunitiesFetchingNextPage])

  const handleEndReached = useCallback(() => {
    if (!areCommunitiesFetching && hasCommunitiesNextPage) {
      fetchCommunitiesNextPage()
    }
  }, [areCommunitiesFetching, fetchCommunitiesNextPage, hasCommunitiesNextPage])

  const listKeyExtractor = useCallback(
    (community: communityModel.Schema) => community.domain_name,
    []
  )

  const renderListEmptyComponent = useCallback(
    () =>
      areCommunitiesFetching ? (
        <View className="w-full grow">
          {[...Array(4).keys()].map(i => (
            <View key={i} className="mx-auto w-5/6 gap-y-2 py-4">
              <View>
                <Skeleton colorMode="light" height={12} width="90%" />
              </View>
              <View>
                <Skeleton colorMode="light" height={12} width="80%" />
              </View>
              <View>
                <Skeleton colorMode="light" height={12} width="60%" />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-Poppins_600SemiBold text-base text-gray-light">
            No results
          </Text>
          <Text className="font-Poppins_500Medium text-gray-light">
            Try refining your search
          </Text>
        </View>
      ),
    [areCommunitiesFetching]
  )

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full flex-1"
      >
        <View className="w-full items-center justify-center gap-y-2 py-4">
          <TextInput
            className="mx-auto w-5/6 rounded-xl bg-gray-100 p-2 font-Poppins_600SemiBold"
            placeholder="Search communities"
            returnKeyType="search"
            onChangeText={setQuery}
            onSubmitEditing={refreshCommunities}
          />
        </View>

        <View className="w-full flex-1 items-center justify-center border-t border-gray-100">
          {areCommunitiesInitialLoading ? (
            <View className="w-full grow">
              {[...Array(4).keys()].map(i => (
                <View key={i} className="mx-auto w-5/6 gap-y-2 py-4">
                  <View>
                    <Skeleton colorMode="light" height={12} width="90%" />
                  </View>
                  <View>
                    <Skeleton colorMode="light" height={12} width="80%" />
                  </View>
                  <View>
                    <Skeleton colorMode="light" height={12} width="60%" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              ItemSeparatorComponent={Separator}
              ListEmptyComponent={renderListEmptyComponent}
              ListFooterComponent={renderListFooterComponent}
              className="w-full"
              keyExtractor={listKeyExtractor}
              keyboardDismissMode="interactive"
              refreshing={areCommunitiesRefreshing}
              renderItem={handleRenderCommunityItem}
              data={communitiesData?.pages
                .map(page => page.communities)
                .flat(1)}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.2}
              onRefresh={refreshCommunities}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
