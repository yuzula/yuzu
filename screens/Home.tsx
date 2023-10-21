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

import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import * as postModel from '../models/post'
import * as profileModel from '../models/profile'
import * as blockService from '../services/block'
import * as communityService from '../services/community'
import * as postService from '../services/post'
import * as profileService from '../services/profile'
import * as reportService from '../services/report'
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
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'controversial'>('hot')

  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

  const [arePostsRefreshing, setArePostsRefreshing] = useState(false)

  const handleCreatePostButtonPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleCreatePostCloseButtonPress = useCallback(() => {
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

  const getPostsSortByHot = useCallback(async () => {
    if (profile) {
      try {
        setPosts(
          await postService.getAll({
            communityDomainName: profile.community_domain_name,
            userId: profile.id,
            sortBy: 'hot'
          })
        )
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [profile])

  const getPostsSortByNew = useCallback(async () => {
    if (profile) {
      try {
        setPosts(
          await postService.getAll({
            communityDomainName: profile.community_domain_name,
            userId: profile.id,
            sortBy: 'new'
          })
        )
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [profile])

  const getPostsSortByControversial = useCallback(async () => {
    if (profile) {
      try {
        setPosts(
          await postService.getAll({
            communityDomainName: profile.community_domain_name,
            userId: profile.id,
            sortBy: 'controversial'
          })
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
            setSortBy('hot')
            await getPostsSortByHot()
            break
          case 1:
            setSortBy('new')
            await getPostsSortByNew()
            break
          case 2:
            setSortBy('controversial')
            await getPostsSortByControversial()
            break
        }

        setArePostsRefreshing(false)
      }
    )
  }, [
    getPostsSortByControversial,
    getPostsSortByHot,
    getPostsSortByNew,
    showActionSheetWithOptions
  ])

  const handlePostsRefresh = useCallback(async () => {
    setArePostsRefreshing(true)

    switch (sortBy) {
      case 'hot':
        await getPostsSortByHot()
        break
      case 'new':
        await getPostsSortByNew()
        break
      case 'controversial':
        await getPostsSortByControversial()
        break
    }

    setArePostsRefreshing(false)
  }, [
    getPostsSortByControversial,
    getPostsSortByHot,
    getPostsSortByNew,
    sortBy
  ])

  const handlePostVoteButtonPress = useCallback(
    async (postId: number, userId: string, vote: 'upvote' | 'downvote') => {
      if (posts) {
        const newPosts = [...posts]

        const newPost = newPosts[newPosts.findIndex(post => post.id === postId)]

        if (!newPost) {
          return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        }

        const oldVote = newPost.current_user_vote

        const resultingVote = getResultingVote({
          oldVote,
          vote
        })

        newPost.current_user_vote = resultingVote.newVote
        newPost.vote_count += resultingVote.delta

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

  const handleBlockAuthorButtonPress = useCallback(
    async (authorId: string) => {
      try {
        if (user) {
          await blockService.blockUser({
            blockerId: user.id,
            blockeeId: authorId
          })

          await handlePostsRefresh()
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handlePostsRefresh, user]
  )

  const handleReportPostButtonPress = useCallback(
    async (post: postModel.Schema) => {
      try {
        if (user) {
          await reportService.reportPost({
            postId: post.id,
            reporterId: user.id
          })

          Alert.alert('Post has been reported for moderation', undefined, [
            {
              onPress: () => {
                Alert.alert(
                  'Would you like to block the author of the post?',
                  undefined,
                  [
                    {
                      text: 'No'
                    },
                    {
                      text: 'Yes',
                      onPress: () => handleBlockAuthorButtonPress(post.user_id)
                    }
                  ]
                )
              }
            }
          ])
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress, user]
  )

  const handlePostEllipsisButtonPress = useCallback(
    (post: postModel.Schema) => {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Report this post', 'Block the author', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2
        },
        async index => {
          if (index === 2) {
            return
          }

          if (index === 0) {
            await handleReportPostButtonPress(post)
          } else if (index === 1) {
            await handleBlockAuthorButtonPress(post.user_id)
          }
        }
      )
    },
    [
      handleBlockAuthorButtonPress,
      handleReportPostButtonPress,
      showActionSheetWithOptions
    ]
  )

  const handleCreatePostSubmitButtonPress = useCallback(
    async ({ content }: CreatePostSchema) => {
      if (profile) {
        setIsCreatePostLoading(true)

        try {
          await postService.create({
            communityDomainName: profile.community_domain_name,
            content,
            userId: profile.id,
            isPrivate: true
          })

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
    getPostsSortByHot()
  }, [getPostsSortByHot, profile])

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
                  onPress={handleCreatePostButtonPress}
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
                            {item.item.username}
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
                        {/* TODO: remove this check once we have more actions in the ellipsis action sheet,
                        since right now it only contains report and block actions, both of which the user can't
                        perform on themselves */}
                        {user.id !== item.item.user_id && (
                          <Pressable
                            className="rounded-lg p-2 active:bg-gray-200"
                            onPress={() =>
                              handlePostEllipsisButtonPress(item.item)
                            }
                          >
                            <Text className="text-apple-gray-light">
                              <AntDesign name="ellipsis1" size={20} />
                            </Text>
                          </Pressable>
                        )}
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
                            handlePostVoteButtonPress(
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
                            handlePostVoteButtonPress(
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
              <Button
                variant="secondary"
                onPress={handleCreatePostCloseButtonPress}
              >
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
