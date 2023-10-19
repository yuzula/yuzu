import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@supabase/supabase-js'
import clsx from 'clsx'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { postDtoSchema, PostSchema, postSchema } from '../models/post'
import { ProfileSchema, profileSchema } from '../models/profile'
import { getPostsWithHotness } from '../services/post'
import { getPostVote, registerPostVote } from '../services/post/vote'
import { RootTabScreenProps } from '../types'

const createPostSchema = z.object({
  content: z.string().min(1).max(300)
})

type CreatePostSchema = z.infer<typeof createPostSchema>

const Home: FunctionComponent<RootTabScreenProps<'Home'>> = () => {
  const insets = useSafeAreaInsets()

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
    reset
  } = useForm<CreatePostSchema>({
    defaultValues: { content: '' },
    mode: 'all',
    resolver: zodResolver(createPostSchema)
  })

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const [user, setUser] = useState<User>()
  const [profile, setProfile] = useState<ProfileSchema>()
  const [posts, setPosts] = useState<PostSchema[]>()
  const [memberCount, setMemberCount] = useState<number>()

  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

  const [arePostsRefreshing, setArePostsRefreshing] = useState(false)

  const handlePostButtonPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handlePostCloseButtonPress = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close the editor?',
        [
          {
            text: 'Yes',
            onPress: () => {
              reset()
              bottomSheetModalRef.current?.close()
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ],
        { cancelable: false }
      )
    } else {
      bottomSheetModalRef.current?.close()
    }
  }, [isDirty, reset])

  const handleSortButtonPress = useCallback(() => {}, [])

  const getPosts = useCallback(async () => {
    if (profile) {
      try {
        const postDtos = postDtoSchema
          .array()
          .parse(await getPostsWithHotness(profile.community_domain_name))

        setPosts(
          postSchema.array().parse(
            await Promise.all(
              postDtos.map(async postDto => {
                const vote = await getPostVote({
                  postId: postDto.id,
                  userId: profile.id
                })

                return {
                  ...postDto,
                  current_user_vote: !vote
                    ? null
                    : vote.is_upvote
                    ? 'upvote'
                    : 'downvote'
                }
              })
            )
          )
        )
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [profile])

  const handlePostsRefresh = useCallback(async () => {
    setArePostsRefreshing(true)

    await getPosts()

    setArePostsRefreshing(false)
  }, [getPosts])

  const handleVoteButtonPress = useCallback(
    async (postId: number, userId: string, vote: 'upvote' | 'downvote') => {
      if (posts) {
        const newPosts = [...posts]

        const post = newPosts[newPosts.findIndex(post => post.id === postId)]

        if (!post) {
          return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }

        const oldVote = post.current_user_vote

        const resultingVote = getResultingVote({
          oldVote,
          vote
        })

        post.current_user_vote = resultingVote.newVote
        post.vote_count += resultingVote.delta

        setPosts(newPosts)

        await registerPostVote({
          postId,
          userId,
          oldVote,
          vote
        })
      }
    },
    [posts]
  )

  const handleCreatePostSubmitButtonPress = useCallback(
    async ({ content }: CreatePostSchema) => {
      if (profile) {
        setIsCreatePostLoading(true)

        try {
          const result = await supabase.from('posts').insert({
            community_domain_name: profile.community_domain_name,
            content,
            user_id: profile.id,
            is_private: true
          })

          if (result.error) {
            return Alert.alert('Could not create post', GENERIC_ERROR_MESSAGE)
          }

          reset()

          bottomSheetModalRef.current?.close()
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        } finally {
          setIsCreatePostLoading(false)
        }
      }
    },
    [profile, reset]
  )

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
    getPosts()
  }, [getPosts, profile])

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
      {!user || !profile || !memberCount || !posts ? (
        <ActivityIndicator />
      ) : (
        <View className="w-full flex-1 pt-6">
          <View className="w-full flex-1 items-center justify-center space-y-4">
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
              refreshing={arePostsRefreshing}
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
                              &nbsp;{item.item.vote_count}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-Poppins_400Regular text-apple-gray-light">
                              <AntDesign name="message1" size={14} />
                              &nbsp;{item.item.comment_count}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-Poppins_400Regular text-apple-gray-light">
                              <AntDesign name="clockcircleo" size={14} />
                              &nbsp;
                              {formatDuration(
                                Date.now() - item.item.created_at.getTime()
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex flex-row items-center space-x-1">
                        <Pressable className="rounded-lg p-2 active:bg-gray-200">
                          <Text className="text-apple-gray-light">
                            <AntDesign name="ellipsis1" size={20} />
                          </Text>
                        </Pressable>
                        <Pressable
                          className={clsx(
                            {
                              'bg-primary active:bg-primary-darker':
                                item.item.current_user_vote === 'upvote',
                              'active:bg-gray-200':
                                item.item.current_user_vote !== 'upvote'
                            },
                            'rounded-lg p-2'
                          )}
                          onPress={() =>
                            handleVoteButtonPress(
                              item.item.id,
                              user.id,
                              'upvote'
                            )
                          }
                        >
                          <Text
                            className={clsx({
                              'text-black':
                                item.item.current_user_vote === 'upvote',
                              'text-apple-gray-light':
                                item.item.current_user_vote !== 'upvote'
                            })}
                          >
                            <AntDesign name="arrowup" size={20} />
                          </Text>
                        </Pressable>
                        <Pressable
                          className={clsx(
                            {
                              'bg-apple-blue-light active:opacity-90':
                                item.item.current_user_vote === 'downvote',
                              'active:bg-gray-200':
                                item.item.current_user_vote !== 'downvote'
                            },
                            'rounded-lg p-2'
                          )}
                          onPress={() =>
                            handleVoteButtonPress(
                              item.item.id,
                              user.id,
                              'downvote'
                            )
                          }
                        >
                          <Text
                            className={clsx({
                              'text-white':
                                item.item.current_user_vote === 'downvote',
                              'text-apple-gray-light':
                                item.item.current_user_vote !== 'downvote'
                            })}
                          >
                            <AntDesign name="arrowdown" size={20} />
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
              onRefresh={handlePostsRefresh}
            />
          </View>
        </View>
      )}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        handleComponent={null}
        snapPoints={['100%']}
      >
        <View
          className="mt-4 flex-1 space-y-4"
          style={{ paddingTop: insets.top }}
        >
          <View className="mx-auto w-5/6 flex-row space-x-2">
            <View className="basis-1/2">
              <Button
                isDisabled={!isValid}
                isLoading={isCreatePostLoading}
                onPress={handleSubmit(handleCreatePostSubmitButtonPress)}
              >
                Submit
              </Button>
            </View>

            <View className="basis-1/2">
              <Button variant="secondary" onPress={handlePostCloseButtonPress}>
                Cancel
              </Button>
            </View>
          </View>

          <View className="grow">
            <Controller
              control={control}
              name="content"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoFocus
                  multiline
                  className="mx-auto w-5/6 font-Poppins_500Medium text-lg"
                  editable={!isCreatePostLoading}
                  maxLength={300}
                  placeholder="What's happening?"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  )
}

export default Home
