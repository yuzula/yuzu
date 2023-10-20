import { useActionSheet } from '@expo/react-native-action-sheet'
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
import * as postModel from '../models/post'
import * as profileModel from '../models/profile'
import * as communityService from '../services/community'
import * as postService from '../services/post'
import * as profileService from '../services/profile'
import * as userService from '../services/user'
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

  const { showActionSheetWithOptions } = useActionSheet()

  const [user, setUser] = useState<User>()
  const [profile, setProfile] = useState<profileModel.Schema>()
  const [posts, setPosts] = useState<postModel.Schema[]>()
  const [memberCount, setMemberCount] = useState<number>()
  const [sortingBy, setSortingBy] = useState<'hot' | 'new' | 'controversial'>(
    'hot'
  )

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

  const doGetPostsSortedByHotness = useCallback(async () => {
    if (profile) {
      try {
        const postDtos = postModel.dtoSchema
          .array()
          .parse(
            await postService.getPostsSortedByHotness(
              profile.community_domain_name
            )
          )

        setPosts(
          postModel.schema.array().parse(
            await Promise.all(
              postDtos.map(async postDto => {
                const vote = await postService.getVote({
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

  const doGetPostsSortedByNew = useCallback(async () => {
    if (profile) {
      try {
        const postDtos = postModel.dtoSchema
          .array()
          .parse(
            await postService.getPostsSortedByNew(profile.community_domain_name)
          )

        setPosts(
          postModel.schema.array().parse(
            await Promise.all(
              postDtos.map(async postDto => {
                const vote = await postService.getVote({
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

  const doGetPostsSortedByCommentCount = useCallback(async () => {
    if (profile) {
      try {
        const postDtos = postModel.dtoSchema
          .array()
          .parse(
            await postService.getPostsSortedByCommentCount(
              profile.community_domain_name
            )
          )

        setPosts(
          postModel.schema.array().parse(
            await Promise.all(
              postDtos.map(async postDto => {
                const vote = await postService.getVote({
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

  const handleSortButtonPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        title: 'Sort posts by',
        options: ['Hot', 'New', 'Controversial', 'Cancel'],
        cancelButtonIndex: 3
      },
      async index => {
        if (index === 3) {
          return
        }

        setArePostsRefreshing(true)

        switch (index) {
          case 0:
            setSortingBy('hot')
            await doGetPostsSortedByHotness()
            break
          case 1:
            setSortingBy('new')
            await doGetPostsSortedByNew()
            break
          case 2:
            setSortingBy('controversial')
            await doGetPostsSortedByCommentCount()
            break
        }

        setArePostsRefreshing(false)
      }
    )
  }, [
    doGetPostsSortedByCommentCount,
    doGetPostsSortedByHotness,
    doGetPostsSortedByNew,
    showActionSheetWithOptions
  ])

  const handleRefresh = useCallback(async () => {
    setArePostsRefreshing(true)

    switch (sortingBy) {
      case 'hot':
        await doGetPostsSortedByHotness()
        break
      case 'new':
        await doGetPostsSortedByNew()
        break
      case 'controversial':
        await doGetPostsSortedByCommentCount()
        break
    }

    setArePostsRefreshing(false)
  }, [
    doGetPostsSortedByCommentCount,
    doGetPostsSortedByHotness,
    doGetPostsSortedByNew,
    sortingBy
  ])

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

        await postService.registerVote({
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
    ;(async () => {
      try {
        setUser(await userService.getCurrentUser())
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    })()
  }, [])

  useEffect(() => {
    doGetPostsSortedByHotness()
  }, [doGetPostsSortedByHotness, profile])

  useEffect(() => {
    ;(async () => {
      if (user) {
        try {
          setProfile(await profileService.get(user.id))
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    })()
  }, [user])

  useEffect(() => {
    ;(async () => {
      if (profile) {
        try {
          setMemberCount(
            await communityService.getMemberCount(profile.community_domain_name)
          )
        } catch (error) {
          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }
      }
    })()
  }, [profile])

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
              onRefresh={handleRefresh}
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
