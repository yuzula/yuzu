import { FontAwesome5 } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { useCreateRootComment } from '../hooks/useCreateRootComment'
import { RootStackScreenProps } from '../types'

const createPostCommentSchema = z.object({
  content: z.string().trim().min(1).max(600)
})

type CreatePostCommentSchema = z.infer<typeof createPostCommentSchema>

export const CreatePostComment: FunctionComponent<
  RootStackScreenProps<'CreatePostComment'>
> = ({
  navigation,
  route: {
    params: { postId, postAuthorUsername, postContent, postCreatedAtTs }
  }
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty }
  } = useForm<CreatePostCommentSchema>({
    defaultValues: { content: '' },
    mode: 'all',
    resolver: zodResolver(createPostCommentSchema)
  })

  const {
    mutate: createRootComment,
    error: createRootCommentError,
    isPending: isCreateRootCommentPending
  } = useCreateRootComment()

  useEffect(() => {
    if (createRootCommentError) {
      Alert.alert('Could not create comment', GENERIC_ERROR_MESSAGE)
    }
  }, [createRootCommentError])

  const handleCreatePostSubmitButtonPress = useCallback(
    async ({ content }: CreatePostCommentSchema) => {
      createRootComment(
        {
          postId,
          content
        },
        {
          // onSuccess: post => {
          //   navigation.replace('Post', { postId: post.id })
          // }
        }
      )
    },
    [createRootComment, postId]
  )

  const handleCloseButtonPress = useCallback(() => {
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
                isLoading={isCreateRootCommentPending}
                onPress={handleSubmit(handleCreatePostSubmitButtonPress)}
              >
                Comment
              </Button>
              <Button
                className="flex-1"
                isDisabled={isCreateRootCommentPending}
                variant="secondary"
                onPress={handleCloseButtonPress}
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
                    className="mx-auto w-5/6 font-Poppins_500Medium text-base"
                    editable={!isCreateRootCommentPending}
                    maxLength={600}
                    placeholder="Share your thoughts"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View className="bg-gray-100 py-2">
              <View className="mx-auto w-5/6 space-y-2">
                <View className="flex-row items-center justify-between space-x-2">
                  <Text
                    className="shrink font-Poppins_500Medium text-gray-600"
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    <FontAwesome5 name="reply" />
                    {'  '}Replying to{' '}
                    <Text className="font-Poppins_600SemiBold">
                      {postAuthorUsername}
                    </Text>
                  </Text>

                  <Text className="font-Poppins_500Medium text-gray-600">
                    {formatDuration(Date.now() - postCreatedAtTs)}
                  </Text>
                </View>

                <Text className="font-Poppins_500Medium">{postContent}</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  )
}
