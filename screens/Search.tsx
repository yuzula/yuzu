import { Skeleton } from 'moti/skeleton'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
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
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { useProfileContext } from '../hooks/useProfileContext'
import { useSearchCommunities } from '../hooks/useSearchCommunities'
import { communityModel } from '../models/community'
import { RootTabScreenProps } from '../types'

export const Search: FunctionComponent<RootTabScreenProps<'Search'>> = ({
  navigation
}) => {
  const insets = useSafeAreaInsets()

  const { profile } = useProfileContext()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  const {
    communities,
    isInitialLoading: areCommunitiesInitialLoading,
    error: communitiesError,
    refresh: refreshCommunities,
    isRefreshing: areCommunitiesRefreshing
  } = useSearchCommunities({ query: debouncedQuery })

  useEffect(() => {
    if (communitiesError) {
      Alert.alert('Could not get communities', GENERIC_ERROR_MESSAGE)
    }
  }, [communitiesError])

  const handleCommunityPress = useCallback(
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

  const handleRenderCommunityItem = useCallback(
    ({ item: community }: ListRenderItemInfo<communityModel.Schema>) => (
      <Pressable
        className="active:bg-gray-200"
        onPress={() => handleCommunityPress(community.domain_name)}
      >
        <View className="mx-auto w-5/6 space-y-2 py-4">
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

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
      style={{ paddingTop: insets.top }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full flex-1"
      >
        <View className="w-full items-center justify-center space-y-2 border-b border-gray-100 py-4">
          <TextInput
            className="mx-auto w-5/6 rounded-xl bg-gray-100 p-2 font-Poppins_600SemiBold"
            placeholder="Search communities"
            returnKeyType="search"
            onChangeText={setQuery}
            onSubmitEditing={refreshCommunities}
          />
        </View>

        <View className="w-full flex-1 items-center justify-center">
          {areCommunitiesInitialLoading ? (
            <View className="w-full grow border-t border-gray-100">
              {[...Array(4).keys()].map(i => (
                <View key={i} className="mx-auto w-5/6 space-y-2 py-4">
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
              className="w-full border-t border-gray-100"
              data={communities}
              keyExtractor={item => item.domain_name}
              keyboardDismissMode="interactive"
              refreshing={areCommunitiesRefreshing}
              renderItem={handleRenderCommunityItem}
              onRefresh={refreshCommunities}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
