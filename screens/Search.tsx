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
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Separator } from '../components/Separator'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { useProfileContext } from '../hooks/useProfileContext'
import { communityModel } from '../models/community'
import { communityService } from '../services/community'
import { RootTabScreenProps } from '../types'

export const Search: FunctionComponent<RootTabScreenProps<'Search'>> = ({
  navigation
}) => {
  const { profile } = useProfileContext()

  const [communities, setCommunities] = useState<communityModel.Schema[]>([])
  const [searchText, setSearchText] = useState('')
  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const getCommunities = useCallback(async () => {
    setIsLoading(true)

    try {
      setCommunities(await communityService.getAll())
    } catch (error) {
      Sentry.Native.captureException(error)

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    } finally {
      setIsLoadingOnMount(false)

      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getCommunities()
  }, [getCommunities])

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

  const handleSearchSubmit = useCallback(async () => {
    if (!searchText.length) {
      return getCommunities()
    }

    setIsLoading(true)

    try {
      setCommunities(await communityService.search(searchText))
    } catch (error) {
      Sentry.Native.captureException(error)

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }, [getCommunities, searchText])

  const handleRefresh = useCallback(async () => {
    await handleSearchSubmit()
  }, [handleSearchSubmit])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
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
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>

        <View className="w-full flex-1 items-center justify-center">
          {isLoadingOnMount ? (
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
              refreshing={isLoading}
              renderItem={({ item }) => (
                <Pressable
                  className="active:bg-gray-200"
                  onPress={() => handleCommunityPress(item.domain_name)}
                >
                  <View className="mx-auto w-5/6 space-y-2 py-4">
                    <Text className="font-Poppins_600SemiBold text-base">
                      @{item.domain_name}
                    </Text>
                    <Text className="font-Poppins_500Medium text-gray-light">
                      {item.member_count} member
                      {item.member_count > 1 ? 's' : null}
                    </Text>
                  </View>
                </Pressable>
              )}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
