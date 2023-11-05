import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import * as Haptics from 'expo-haptics'
import { Skeleton } from 'moti/skeleton'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { retryPromise } from '../helpers/promise'
import { formatDuration } from '../helpers/time'
import { useAuthContext } from '../hooks/useAuthContext'
import { useMemberCount } from '../hooks/useMemberCount'
import { usePosts } from '../hooks/usePosts'
import { useProfileContext } from '../hooks/useProfileContext'
import { postModel } from '../models/post'
import { blockService } from '../services/block'
import { postService } from '../services/post'
import { reportService } from '../services/report'
import { RootTabScreenProps } from '../types'

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(300)
})

type CreatePostSchema = z.infer<typeof createPostSchema>

export const Home: FunctionComponent<RootTabScreenProps<'Home'>> = ({
  navigation,
  route
}) => {
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

  const { user } = useAuthContext()
  const { profile } = useProfileContext()

  const {
    posts,
    isLoadingOnMount: arePostsLoadingOnMount,
    isLoading: arePostsLoading,
    sortPosts,
    refreshPosts,
    votePost
  } = usePosts({
    communityDomainName: profile?.community_domain_name
  })

  const { memberCount, isLoading: isMemberCountLoading } = useMemberCount()

  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

  const areResourcesLoadingOnMount =
    arePostsLoadingOnMount || isMemberCountLoading

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
        ]
      )
    } else {
      bottomSheetModalRef.current?.close()
    }
  }, [isDirty, reset])

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

        switch (index) {
          case 0:
            await sortPosts('hot')
            break
          case 1:
            await sortPosts('new')
            break
          case 2:
            await sortPosts('controversial')
            break
        }
      }
    )
  }, [showActionSheetWithOptions, sortPosts])

  const handlePostsRefresh = useCallback(async () => {
    refreshPosts()
  }, [refreshPosts])

  const handlePostVoteButtonPress = useCallback(
    async (postId: number, vote: 'upvote' | 'downvote') => {
      await votePost({ postId, vote })
    },
    [votePost]
  )

  const handleBlockAuthorButtonPress = useCallback(
    async (authorId: string) => {
      try {
        if (user) {
          await retryPromise(() =>
            blockService.blockUser({
              blockerId: user.id,
              blockeeId: authorId
            })
          )

          await handlePostsRefresh()
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handlePostsRefresh, user]
  )

  const handleReportPostButtonPress = useCallback(
    async (post: postModel.Schema) => {
      try {
        if (user) {
          await retryPromise(() => reportService.reportPost(post.id))

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
                      onPress: () => {
                        if (post.user_id) {
                          handleBlockAuthorButtonPress(post.user_id)
                        }
                      }
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
        Sentry.Native.captureException(error)

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
          } else if (index === 1 && post.user_id) {
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
          const postId = await retryPromise(() =>
            postService.create({
              communityDomainName: profile.community_domain_name,
              content,
              userId: profile.id,
              isPrivate: true
            })
          )

          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          )

          reset()

          bottomSheetModalRef.current?.close()

          handlePostsRefresh()

          navigation.navigate('Post', { postId })
        } catch (error) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          )

          Sentry.Native.captureException(error)

          Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
        } finally {
          setIsCreatePostLoading(false)
        }
      }
    },
    [handlePostsRefresh, navigation, profile, reset]
  )

  const handlePostPress = useCallback(
    (postId: number) => {
      navigation.navigate('Post', { postId })
    },
    [navigation]
  )

  useEffect(() => {
    if (route.params?.shouldRefresh) {
      handlePostsRefresh()
    }
  }, [handlePostsRefresh, route.params?.shouldRefresh])

  if (!user || !profile) {
    return null
  }

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      <View className="w-full flex-1 pt-6">
        <View className="w-full flex-1 items-center justify-center space-y-4">
          <View className="w-5/6 space-y-2">
            <Text className="font-Poppins_700Bold text-xl">
              {profile.community_domain_name}
            </Text>
            <View>
              <Skeleton colorMode="light" show={areResourcesLoadingOnMount}>
                <Text className="font-Poppins_600SemiBold text-apple-gray-light">
                  {`${memberCount} ${memberCount > 1 ? 'members' : 'member'}`}
                </Text>
              </Skeleton>
            </View>
          </View>

          <View className="w-5/6 flex-row space-x-2">
            <View className="grow">
              <Button onPress={handleCreatePostButtonPress}>
                <FontAwesome5 name="pen" />
                &nbsp;&nbsp;Post
              </Button>
            </View>
            <View className="grow">
              <Button variant="secondary" onPress={handleSortButtonPress}>
                <FontAwesome5 name="sort" />
                &nbsp;&nbsp;Sort
              </Button>
            </View>
          </View>

          {areResourcesLoadingOnMount ? (
            <View className="w-full grow">
              {[...Array(4).keys()].map(i => (
                <View key={i} className="mx-auto w-5/6 space-y-2 py-4">
                  <View>
                    <Skeleton colorMode="light" radius="round" />
                  </View>
                  <View>
                    <Skeleton colorMode="light" height={10} width="60%" />
                  </View>
                  <View>
                    <Skeleton colorMode="light" height={10} width="80%" />
                  </View>
                  <View>
                    <Skeleton colorMode="light" height={10} width="90%" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              className="w-full border-t border-gray-200"
              contentContainerStyle={{ flexGrow: 1 }}
              data={posts}
              keyExtractor={item => item.id.toString()}
              refreshing={arePostsLoading}
              ItemSeparatorComponent={() => (
                <View className="w-full border-t border-gray-200" />
              )}
              ListEmptyComponent={() => (
                <View className="flex-1 items-center justify-center">
                  <Text className="font-Poppins_600SemiBold text-base text-apple-gray-light">
                    No posts yet
                  </Text>
                  <Text className="font-Poppins_500Medium text-apple-gray-light">
                    Be the first to post!
                  </Text>
                </View>
              )}
              renderItem={item => (
                <Pressable
                  className="active:bg-gray-200"
                  onPress={() => handlePostPress(item.item.id)}
                >
                  <View className="mx-auto w-5/6 space-y-2 py-4">
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={4}
                      className={clsx('font-Poppins_600SemiBold text-base', {
                        'font-Poppins_600SemiBold_Italic':
                          item.item.is_deleted || item.item.is_flagged
                      })}
                    >
                      {item.item.is_deleted
                        ? 'Deleted'
                        : item.item.is_flagged
                        ? 'Flagged'
                        : item.item.content}
                    </Text>

                    <View className="flex flex-row items-center justify-between">
                      <View className="space-y-1">
                        <Text className="font-Poppins_500Medium text-apple-gray-light">
                          by&nbsp;
                          <Text
                            className={clsx('font-Poppins_600SemiBold', {
                              'font-Poppins_600SemiBold_Italic':
                                item.item.is_deleted
                            })}
                          >
                            {item.item.is_deleted
                              ? 'Deleted'
                              : item.item.username}
                          </Text>
                        </Text>
                        <View className="flex flex-row space-x-2">
                          <View>
                            <Text className="font-Poppins_500Medium text-apple-gray-light">
                              <FontAwesome5 name="arrow-up" size={14} />
                              &nbsp;{item.item.vote_count}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-Poppins_500Medium text-apple-gray-light">
                              <FontAwesome5 name="comment-dots" size={14} />
                              &nbsp;{item.item.comment_count}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-Poppins_500Medium text-apple-gray-light">
                              <FontAwesome5 name="clock" size={14} />
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
                              <FontAwesome5 name="ellipsis-h" size={16} />
                            </Text>
                          </Pressable>
                        )}
                        <Pressable
                          className={clsx(
                            {
                              'bg-apple-pink-light active:opacity-90':
                                item.item.current_user_vote === 'upvote',
                              'active:bg-gray-200':
                                item.item.current_user_vote !== 'upvote'
                            },
                            'rounded-lg p-2'
                          )}
                          onPress={() =>
                            handlePostVoteButtonPress(item.item.id, 'upvote')
                          }
                        >
                          <Text
                            className={clsx({
                              'text-white':
                                item.item.current_user_vote === 'upvote',
                              'text-apple-gray-light':
                                item.item.current_user_vote !== 'upvote'
                            })}
                          >
                            <FontAwesome5 name="arrow-up" size={16} />
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
                            handlePostVoteButtonPress(item.item.id, 'downvote')
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
                            <FontAwesome5 name="arrow-down" size={16} />
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
              onRefresh={handlePostsRefresh}
            />
          )}
        </View>
      </View>

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
                Post
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
                  className="mx-auto w-5/6 font-Poppins_600SemiBold text-lg"
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
