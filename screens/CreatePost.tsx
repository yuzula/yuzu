import { zodResolver } from '@hookform/resolvers/zod'
import * as Haptics from 'expo-haptics'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, TextInput, View } from 'react-native'
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
> = ({ navigation }) => {
  const { profile } = useProfileContext()

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

  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

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
    [navigation, profile, reset]
  )

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
              navigation.goBack()
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      )
    } else {
      navigation.goBack()
    }
  }, [isDirty, navigation, reset])

  return (
    <SafeAreaView className="flex-1 space-y-4 bg-white pt-4">
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
    </SafeAreaView>
  )
}
