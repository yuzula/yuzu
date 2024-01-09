import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeletePost } from '../hooks/useDeletePost'
import { useReportPost } from '../hooks/useReportPost'
import { postModel } from '../models/post'

interface PostEllipsisButtonProps {
  post: postModel.Schema
  size?: number
  variant?: 'parent' | 'child'
}

export const PostEllipsisButton: FunctionComponent<PostEllipsisButtonProps> =
  memo(({ post, size = 18, variant = 'child' }) => {
    const { profile } = useAuthenticatedProfile()

    const { showActionSheetWithOptions } = useActionSheet()

    const { mutate: deletePost, error: deletePostError } = useDeletePost()

    const { mutate: blockUser, error: blockUserError } = useBlockUser()

    const { mutate: reportPost, error: reportPostError } = useReportPost()

    useEffect(() => {
      if (deletePostError) {
        Alert.alert('Could not delete post', GENERIC_ERROR_MESSAGE)
      }
    }, [deletePostError])

    useEffect(() => {
      if (blockUserError) {
        Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
      }
    }, [blockUserError])

    useEffect(() => {
      if (reportPostError) {
        Alert.alert('Could not report post', GENERIC_ERROR_MESSAGE)
      }
    }, [reportPostError])

    const handleReportPostSuccess = useCallback(() => {
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
                      blockUser({ userId: post.user_id })
                    } else {
                      Sentry.Native.captureException(
                        'Post author ID is not defined'
                      )

                      Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
                    }
                  }
                }
              ]
            )
          }
        }
      ])
    }, [blockUser, post.user_id])

    const handleReportButtonPress = useCallback(() => {
      Alert.alert('Are you sure you want to report this post?', undefined, [
        {
          text: 'Yes',
          onPress: () => {
            reportPost(
              { postId: post.id },
              {
                onSuccess: handleReportPostSuccess
              }
            )
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ])
    }, [handleReportPostSuccess, post.id, reportPost])

    const handleOwnPostEllipsisButtonPress = useCallback(() => {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Delete this post', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1
        },
        index => {
          if (index === 1) {
            return
          }

          Alert.alert('Are you sure you want to delete this post?', undefined, [
            {
              text: 'Yes',
              style: 'destructive',
              onPress: () => {
                deletePost({ postId: post.id })
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ])
        }
      )
    }, [deletePost, post.id, showActionSheetWithOptions])

    const handleBlockAuthorButtonPress = useCallback(() => {
      Alert.alert(
        'Are you sure you want to block the author of this post?',
        undefined,
        [
          {
            text: 'Yes',
            onPress: () => {
              if (post.user_id) {
                blockUser({ userId: post.user_id })
              } else {
                Sentry.Native.captureException('Post author ID is not defined')

                Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      )
    }, [blockUser, post.user_id])

    const handleOtherPostEllipsisButtonPress = useCallback(() => {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Report this post', 'Block the author', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2
        },
        index => {
          if (index === 2) {
            return
          }

          if (index === 0) {
            handleReportButtonPress()
          } else if (index === 1) {
            handleBlockAuthorButtonPress()
          }
        }
      )
    }, [
      handleBlockAuthorButtonPress,
      handleReportButtonPress,
      showActionSheetWithOptions
    ])

    const handlePress = useCallback(() => {
      if (profile.id === post.user_id) {
        handleOwnPostEllipsisButtonPress()
      } else {
        handleOtherPostEllipsisButtonPress()
      }
    }, [
      handleOtherPostEllipsisButtonPress,
      handleOwnPostEllipsisButtonPress,
      post.user_id,
      profile.id
    ])

    return (
      <Pressable
        className={clsx({
          'rounded-lg p-2 active:bg-gray-200': variant === 'child'
        })}
        onPress={handlePress}
      >
        <Text className={clsx({ 'text-gray-light': variant === 'child' })}>
          <FontAwesome5 name="ellipsis-h" size={size} />
        </Text>
      </Pressable>
    )
  })
