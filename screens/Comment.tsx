/* eslint-disable */
import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View
} from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useChildComments } from '../hooks/useChildComments'
import { useComment } from '../hooks/useComment'
import { useDeleteComment } from '../hooks/useDeleteComment'
import { useReportComment } from '../hooks/useReportComment'
import { commentModel } from '../models/comment'
import { RootStackScreenProps } from '../types'

export const Comment: FunctionComponent<RootStackScreenProps<'Comment'>> = ({
  navigation,
  route: {
    params: { postId, commentId }
  }
}) => {
  const [areCommentsInitialLoading, setAreCommentsInitialLoading] =
    useState(true)
  const [isCommentInitialLoading, setIsCommentInitialLoading] = useState(true)

  const { showActionSheetWithOptions } = useActionSheet()

  const { profile } = useAuthenticatedProfile()

  const {
    data: comment,
    error: commentError,
    isFetching: isCommentFetching,
    refetch: refetchComment
  } = useComment(commentId)

  const {
    data: commentsData,
    error: commentsError,
    isFetching: areCommentsFetching,
    refetch: refetchComments,
    fetchNextPage: fetchCommentsNextPage,
    hasNextPage: hasCommentsNextPage,
    isFetchingNextPage: areCommentsFetchingNextPage
  } = useChildComments({ commentId })

  const { mutate: deleteComment, error: deleteCommentError } =
    useDeleteComment()

  const { mutate: blockUser, error: blockUserError } = useBlockUser()

  const { mutate: reportComment, error: reportCommentError } =
    useReportComment()

  useEffect(() => {
    if (!areCommentsFetching) {
      setAreCommentsInitialLoading(false)
    }
  }, [areCommentsFetching])

  useEffect(() => {
    if (!isCommentFetching) {
      setIsCommentInitialLoading(false)
    }
  }, [areCommentsFetching, isCommentFetching])

  useEffect(() => {
    if (commentError) {
      Sentry.Native.captureException(commentError)

      Alert.alert('Could not fetch comment', GENERIC_ERROR_MESSAGE)
    }
  }, [commentError])

  useEffect(() => {
    if (commentsError) {
      Sentry.Native.captureException(commentsError)

      Alert.alert('Could not fetch comments', GENERIC_ERROR_MESSAGE)
    }
  }, [commentsError])

  useEffect(() => {
    if (deleteCommentError) {
      Sentry.Native.captureException(deleteCommentError)

      Alert.alert('Could not delete comment', GENERIC_ERROR_MESSAGE)
    }
  }, [deleteCommentError])

  useEffect(() => {
    if (blockUserError) {
      Sentry.Native.captureException(blockUserError)

      Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
    }
  }, [blockUserError])

  useEffect(() => {
    if (reportCommentError) {
      Sentry.Native.captureException(reportCommentError)

      Alert.alert('Could not report comment', GENERIC_ERROR_MESSAGE)
    }
  }, [reportCommentError])

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Post', { postId })
    }
  }, [navigation, postId])

  const handleBlockAuthorButtonPress = useCallback(
    (authorId: string) => {
      if (!comment) {
        return Alert.alert('Could not get post', GENERIC_ERROR_MESSAGE)
      }

      blockUser({ userId: authorId })

      if (authorId === comment.user_id) {
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.replace('Tabs')
        }
      }
    },
    [blockUser, comment, navigation]
  )

  const handleReportCommentButtonPress = useCallback(
    (comment: commentModel.Schema) => {
      reportComment({ commentId: comment.id })

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
                      handleBlockAuthorButtonPress(comment.user_id)
                    }
                  }
                }
              ]
            )
          }
        }
      ])
    },
    [handleBlockAuthorButtonPress, reportComment]
  )

  const handleCommentEllipsisButtonPress = useCallback(() => {
    if (!comment) {
      return Alert.alert('Could not get comment details', GENERIC_ERROR_MESSAGE)
    }

    if (profile.id === comment.user_id) {
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
                  deleteComment({ commentId })

                  if (navigation.canGoBack()) {
                    navigation.goBack()
                  } else {
                    navigation.replace('Post', { postId })
                  }
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
    } else {
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
            handleReportCommentButtonPress(comment)
          } else if (index === 1 && comment.user_id) {
            handleBlockAuthorButtonPress(comment.user_id)
          }
        }
      )
    }
  }, [
    comment,
    commentId,
    deleteComment,
    handleBlockAuthorButtonPress,
    handleReportCommentButtonPress,
    navigation,
    postId,
    profile.id,
    showActionSheetWithOptions
  ])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full flex-1"
      >
        <View className="border-b border-gray-100">
          <View className="mx-auto w-5/6 flex-row items-center justify-between">
            <Pressable className="py-4 pr-4" onPress={handleBackButtonPress}>
              <FontAwesome5 name="chevron-left" size={16} />
            </Pressable>
            <Text
              className="shrink text-center font-Poppins_700Bold text-base"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              Comment
            </Text>
            <Pressable
              className="py-4 pl-4"
              onPress={handleCommentEllipsisButtonPress}
            >
              <FontAwesome5 name="ellipsis-h" size={16} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
