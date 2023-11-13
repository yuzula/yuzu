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
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Separator } from '../components/Separator'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { communityModel } from '../models/community'
import { communityService } from '../services/community'
import { RootTabScreenProps } from '../types'

export const Search: FunctionComponent<RootTabScreenProps<'Search'>> = () => {
  const [communities, setCommunities] = useState<communityModel.Schema[]>([])
  const [isLoadingOnMount, setIsLoadingOnMount] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setCommunities(await communityService.getAll())
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoadingOnMount(false)
      }
    })()
  }, [])

  const handleCommunityPress = useCallback((_domainName: string) => {}, [])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <View className="w-full items-center justify-center space-y-2 border-b border-gray-100 py-4">
        <TextInput
          autoFocus
          className="mx-auto w-5/6 rounded-xl bg-gray-100 p-2 font-Poppins_600SemiBold"
          placeholder="Search communities"
          returnKeyType="search"
        />
      </View>

      <View className="w-full flex-1 items-center justify-center">
        {isLoadingOnMount ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            ItemSeparatorComponent={Separator}
            className="w-full border-t border-gray-100"
            data={communities}
            keyExtractor={item => item.domain_name}
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
          />
        )}
      </View>
    </SafeAreaView>
  )
}
