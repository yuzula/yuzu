import { FontAwesome5 } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import * as Haptics from 'expo-haptics'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { retryPromise } from '../helpers/promise'
import { useProfileContext } from '../hooks/useProfileContext'
import { postService } from '../services/post'
import { RootStackScreenProps } from '../types'

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(300)
})

type CreatePostSchema = z.infer<typeof createPostSchema>

export const CreatePost: FunctionComponent<
  RootStackScreenProps<'CreatePost'>
> = ({
  navigation,
  route: {
    params: {
      initialIsPrivate = false,
      communityDomainName,
      isVisibilityChangeable = true
    }
  }
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty }
  } = useForm<CreatePostSchema>({
    defaultValues: { content: '' },
    mode: 'all',
    resolver: zodResolver(createPostSchema)
  })

  const { profile } = useProfileContext()

  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)

  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

  const handleCreatePostSubmitButtonPress = useCallback(
    async ({ content }: CreatePostSchema) => {
      if (profile) {
        setIsCreatePostLoading(true)

        try {
          const postId = await retryPromise(() =>
            postService.create({
              communityDomainName,
              content,
              userId: profile.id,
              isPrivate
            })
          )

          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          )

          navigation.replace('Post', { postId })
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
    [communityDomainName, isPrivate, navigation, profile]
  )

  const handleCreatePostCloseButtonPress = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Unsaved changes',
        'You have unsaved changes. Are you sure you want to close the editor?',
        [
          {
            text: 'Yes',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack()
              } else {
                Sentry.Native.captureException('Could not go back')

                Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      )
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        Sentry.Native.captureException('Could not go back')

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    }
  }, [isDirty, navigation])

  const handleVisibilityButtonPress = useCallback(() => {
    if (!profile) {
      Sentry.Native.captureException('Profile is not defined')

      return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    }

    if (isVisibilityChangeable) {
      Alert.alert(
        isPrivate ? 'Make post public' : 'Make post private',
        isPrivate
          ? `The post will be visible to everyone, including those who don't have a @${profile.community_domain_name} email.`
          : `The post will be visible only to your peers that have a @${profile.community_domain_name} email.`,
        [
          {
            text: 'Yes',
            onPress: () => {
              setIsPrivate(prevIsPrivate => !prevIsPrivate)
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      )
    } else {
      Alert.alert(
        'Visibility cannot be changed',
        `Only users with @${communityDomainName} emails can create internal posts in this community`
      )
    }
  }, [communityDomainName, isPrivate, isVisibilityChangeable, profile])

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-gray-100"
        >
          <View className="flex-1 space-y-4 bg-white pt-4">
            <View className="mx-auto flex w-5/6 flex-row space-x-2">
              <Button
                className="flex-1"
                isDisabled={!isValid}
                isLoading={isCreatePostLoading}
                onPress={handleSubmit(handleCreatePostSubmitButtonPress)}
              >
                Post
              </Button>
              <Button
                className="flex-1"
                variant="secondary"
                onPress={handleCreatePostCloseButtonPress}
              >
                Cancel
              </Button>
            </View>

            <View className="flex-1">
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

            <View className="bg-gray-100 py-2">
              <View className="mx-auto w-5/6 flex-row items-center justify-between space-x-2">
                <Text
                  className="shrink font-Poppins_500Medium text-gray-600"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  Posting to{' '}
                  <Text className="font-Poppins_600SemiBold">
                    @{communityDomainName}
                  </Text>
                </Text>
                <Pressable
                  className="rounded-lg p-2 active:bg-gray-200"
                  onPress={handleVisibilityButtonPress}
                >
                  <Text
                    className={clsx({
                      'text-yellow-light': isPrivate,
                      'text-gray-600': !isPrivate
                    })}
                  >
                    {isPrivate ? (
                      <FontAwesome5 name="lock" size={16} />
                    ) : (
                      <FontAwesome5 name="lock-open" size={16} />
                    )}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  )
}
