import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { User } from '@supabase/supabase-js'
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
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { PostSchema, postSchema } from '../models/post'
import { ProfileSchema, profileSchema } from '../models/profile'
import { RootTabScreenProps } from '../types'

const Home: FunctionComponent<RootTabScreenProps<'Home'>> = ({
  navigation
}) => {
  const [user, setUser] = useState<User>()
  const [profile, setProfile] = useState<ProfileSchema>()
  const [posts, setPosts] = useState<PostSchema[]>()
  const [memberCount, setMemberCount] = useState<number>()

  const handlePostButtonPress = useCallback(() => {
    if (profile) {
      navigation.navigate('CreatePost', {
        communityDomainName: profile.community_domain_name
      })
    } else {
      Alert.alert('We could fetch your profile', GENERIC_ERROR_MESSAGE)
    }
  }, [navigation, profile])

  const handleSortButtonPress = useCallback(() => {}, [])

  useEffect(() => {
    const doGetUser = async () => {
      try {
        const user = await supabase.auth.getUser()

        if (user.error) {
          return Alert.alert('Could not fetch user', GENERIC_ERROR_MESSAGE)
        }

        setUser(user.data.user)
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }

    doGetUser()
  }, [])

  useEffect(() => {
    const doGetPosts = async () => {
      if (profile) {
        try {
          const posts = await supabase
            .from('posts_with_hotness')
            .select()
            .eq('community_domain_name', profile.community_domain_name)
            .order('hotness', { ascending: false })

          if (posts.error) {
            return Alert.alert('Could not fetch posts', GENERIC_ERROR_MESSAGE)
          }

          setPosts(postSchema.array().parse(posts.data))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    }

    doGetPosts()
  }, [profile])

  useEffect(() => {
    const doGetProfile = async () => {
      if (user) {
        try {
          const profile = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)
            .single()

          setProfile(profileSchema.parse(profile.data))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    }

    doGetProfile()
  }, [user])

  useEffect(() => {
    const doGetMemberCount = async () => {
      if (profile) {
        try {
          const memberCount = await supabase.rpc('count_community_members', {
            domain_name: profile.community_domain_name
          })

          setMemberCount(z.number().parse(memberCount.data))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    }

    doGetMemberCount()
  }, [profile, user])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      {!profile || !memberCount || !posts ? (
        <ActivityIndicator />
      ) : (
        <View className="w-full flex-1 pt-6">
          <View className="w-full items-center justify-center space-y-4">
            <View className="w-5/6 space-y-2">
              <Text className="font-Poppins_700Bold text-xl">
                {profile.community_domain_name}
              </Text>
              <Text className="font-Poppins_500Medium text-apple-gray-light">
                {`${memberCount} ${memberCount > 1 ? 'members' : 'member'}`}
              </Text>
            </View>

            <View className="w-5/6 flex-row space-x-2">
              <View className="grow">
                <Button
                  className="h-9 rounded-lg"
                  onPress={handlePostButtonPress}
                >
                  <FontAwesome5 name="pen" />
                  &nbsp;Post
                </Button>
              </View>
              <View className="grow">
                <Button
                  className="h-9 rounded-lg"
                  variant="secondary"
                  onPress={handleSortButtonPress}
                >
                  <FontAwesome5 name="sort" />
                  &nbsp;Sort
                </Button>
              </View>
            </View>

            <FlatList
              scrollEnabled
              className="w-full grow border-t border-gray-200"
              data={posts}
              keyExtractor={item => item.id.toString()}
              ItemSeparatorComponent={() => (
                <View className="w-full border-t border-gray-200" />
              )}
              renderItem={item => (
                <Pressable className="active:bg-gray-200">
                  <View className="mx-auto w-5/6 space-y-2 py-4">
                    <Text
                      className="font-Poppins_400Regular"
                      ellipsizeMode="tail"
                      numberOfLines={4}
                    >
                      {item.item.content}
                    </Text>

                    <View className="flex flex-row items-center justify-between">
                      <View className="space-y-1">
                        <Text className="font-Poppins_400Regular text-apple-gray-light">
                          by&nbsp;
                          <Text className="font-Poppins_500Medium">
                            maxwowo
                          </Text>
                        </Text>
                        <View className="flex flex-row space-x-2">
                          <View>
                            <Text className="font-Poppins_400Regular text-apple-gray-light">
                              <AntDesign name="arrowup" size={14} />
                              &nbsp;25
                            </Text>
                          </View>
                          <View>
                            <Text className="font-Poppins_400Regular text-apple-gray-light">
                              <AntDesign name="message1" size={14} />
                              &nbsp;4
                            </Text>
                          </View>
                          <View>
                            <Text className="font-Poppins_400Regular text-apple-gray-light">
                              <AntDesign name="clockcircleo" size={14} />
                              &nbsp;1h
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex flex-row items-center">
                        <Pressable className="rounded-lg p-2 active:bg-gray-200">
                          <Text className="text-apple-gray-light">
                            <AntDesign name="ellipsis1" size={20} />
                          </Text>
                        </Pressable>
                        <Pressable className="rounded-lg p-2 active:bg-gray-200">
                          <Text className="text-apple-gray-light">
                            <AntDesign name="arrowup" size={20} />
                          </Text>
                        </Pressable>
                        <Pressable className="rounded-lg p-2 active:bg-gray-200">
                          <Text className="text-apple-gray-light">
                            <AntDesign name="arrowdown" size={20} />
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default Home
