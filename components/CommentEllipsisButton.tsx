import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeleteComment } from '../hooks/useDeleteComment'
import { useReportComment } from '../hooks/useReportComment'
import { commentModel } from '../models/comment'

interface CommentEllipsisButtonProps {
  comment: commentModel.Schema
  size?: number
  variant?: 'parent' | 'child'
}

export const CommentEllipsisButton: FunctionComponent<CommentEllipsisButtonProps> =
  memo(({ comment, size = 14, variant = 'child' }) => {
    const { profile } = useAuthenticatedProfile()

    const { showActionSheetWithOptions } = useActionSheet()

    const { mutate: deleteComment, error: deleteCommentError } =
      useDeleteComment()

    const { mutate: blockUser, error: blockUserError } = useBlockUser()

    const { mutate: reportComment, error: reportCommentError } =
      useReportComment()

    useEffect(() => {
      if (deleteCommentError) {
        Alert.alert('Could not delete comment', GENERIC_ERROR_MESSAGE)
      }
    }, [deleteCommentError])

    useEffect(() => {
      if (blockUserError) {
        Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
      }
    }, [blockUserError])

    useEffect(() => {
      if (reportCommentError) {
        Alert.alert('Could not report comment', GENERIC_ERROR_MESSAGE)
      }
    }, [reportCommentError])

    const handleReportCommentSuccess = useCallback(() => {
      Alert.alert('Comment has been reported for moderation', undefined, [
        {
          onPress: () => {
            Alert.alert(
              'Would you like to block the author of the comment?',
              undefined,
              [
                {
                  text: 'No'
                },
                {
                  text: 'Yes',
                  onPress: () => {
                    if (comment.user_id) {
                      blockUser({ userId: comment.user_id })
                    } else {
                      Sentry.Native.captureException(
                        'Comment author ID is not defined'
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
    }, [blockUser, comment.user_id])

    const handleReportButtonPress = useCallback(() => {
      Alert.alert('Are you sure you want to report this Comment?', undefined, [
        {
          text: 'Yes',
          onPress: () => {
            reportComment(
              { commentId: comment.id },
              {
                onSuccess: handleReportCommentSuccess
              }
            )
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ])
    }, [comment.id, handleReportCommentSuccess, reportComment])

    const handleOwnCommentEllipsisButtonPress = useCallback(() => {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Delete this comment', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1
        },
        index => {
          if (index === 1) {
            return
          }

          Alert.alert(
            'Are you sure you want to delete this comment?',
            undefined,
            [
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {
                  deleteComment({ commentId: comment.id })
                }
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          )
        }
      )
    }, [comment.id, deleteComment, showActionSheetWithOptions])

    const handleBlockAuthorButtonPress = useCallback(() => {
      Alert.alert(
        'Are you sure you want to block the author of this comment?',
        undefined,
        [
          {
            text: 'Yes',
            onPress: () => {
              if (comment.user_id) {
                blockUser({ userId: comment.user_id })
              } else {
                Sentry.Native.captureException(
                  'Comment author ID is not defined'
                )

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
    }, [blockUser, comment.user_id])

    const handleOtherCommentEllipsisButtonPress = useCallback(() => {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Report this comment', 'Block the author', 'Cancel'],
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
      if (profile.id === comment.user_id) {
        handleOwnCommentEllipsisButtonPress()
      } else {
        handleOtherCommentEllipsisButtonPress()
      }
    }, [
      comment.user_id,
      handleOtherCommentEllipsisButtonPress,
      handleOwnCommentEllipsisButtonPress,
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
