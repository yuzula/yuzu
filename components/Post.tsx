import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeletePost } from '../hooks/useDeletePost'
import { useReportPost } from '../hooks/useReportPost'
import { useVotePost } from '../hooks/useVotePost'
import { postModel } from '../models/post'

interface PostProps {
  post: postModel.Schema
  shouldDisplayCommunityDomainName?: boolean
  onCommunityDomainNamePress?: (domainName: string) => void
}

export const Post: FunctionComponent<PostProps> = memo(
  ({
    post,
    shouldDisplayCommunityDomainName = false,
    onCommunityDomainNamePress
  }) => {
    const navigation = useNavigation()

    const { profile } = useAuthenticatedProfile()

    const { showActionSheetWithOptions } = useActionSheet()

    const { mutate: deletePost, error: deletePostError } = useDeletePost()

    const { mutate: blockUser, error: blockUserError } = useBlockUser()

    const { mutate: reportPost, error: reportPostError } = useReportPost()

    const { mutate: votePost, error: votePostError } = useVotePost({
      postId: post.id
    })

    useEffect(() => {
      if (votePostError) {
        Alert.alert('Could not vote on post', GENERIC_ERROR_MESSAGE)
      }
    }, [votePostError])

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

    const handleDomainNamePress = useCallback(() => {
      if (!post.community_domain_name) {
        Sentry.Native.captureException('communityDomainName is not defined')

        return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }

      onCommunityDomainNamePress?.(post.community_domain_name)
    }, [onCommunityDomainNamePress, post.community_domain_name])

    const handlePress = useCallback(() => {
      navigation.navigate('Post', { postId: post.id })
    }, [navigation, post.id])

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

    const handleEllipsisButtonPress = useCallback(() => {
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

    const handleUpvoteButtonPress = useCallback(() => {
      const { newVote, delta } = getResultingVote({
        oldVote: post.current_user_vote,
        vote: 'upvote'
      })

      votePost({ vote: newVote, delta })
    }, [post.current_user_vote, votePost])

    const handleDownvoteButtonPress = useCallback(() => {
      const { newVote, delta } = getResultingVote({
        oldVote: post.current_user_vote,
        vote: 'downvote'
      })

      votePost({ vote: newVote, delta })
    }, [post.current_user_vote, votePost])

    return (
      <Pressable className="active:bg-gray-200" onPress={handlePress}>
        <View className="mx-auto w-5/6 space-y-2 py-4">
          {shouldDisplayCommunityDomainName && (
            <View className="flex-row">
              <Pressable className="shrink" onPress={handleDomainNamePress}>
                <Text className="font-Poppins_600SemiBold text-gray-light">
                  @{post.community_domain_name}
                </Text>
              </Pressable>
            </View>
          )}

          <Text
            ellipsizeMode="tail"
            numberOfLines={4}
            className={clsx('font-Poppins_600SemiBold text-base', {
              'text-gray-light':
                post.is_deleted || post.is_flagged || post.is_blocked
            })}
          >
            {post.is_deleted
              ? 'This post has been deleted'
              : post.is_flagged
                ? 'This post has been flagged by the community'
                : post.is_blocked
                  ? 'This post was submitted by a blocked user'
                  : post.content}
          </Text>

          <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex-1 space-y-1">
              <Text
                className="shrink font-Poppins_500Medium text-gray-light"
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                by{' '}
                <Text className="font-Poppins_600SemiBold">
                  {post.is_deleted
                    ? 'Deleted'
                    : post.is_blocked
                      ? 'Blocked'
                      : post.username}
                </Text>
              </Text>
              <View className="flex flex-row items-center space-x-2">
                <Text className="font-Poppins_500Medium text-gray-light">
                  <FontAwesome5 name="arrow-up" size={14} /> {post.vote_count}
                </Text>
                <Text className="font-Poppins_500Medium text-gray-light">
                  <FontAwesome5 name="comment" size={14} /> {post.comment_count}
                </Text>
                <Text className="font-Poppins_500Medium text-gray-light">
                  <FontAwesome5 name="clock" size={14} />{' '}
                  {formatDuration(Date.now() - post.created_at.getTime())}
                </Text>
                {post.is_private && (
                  <Text className="text-yellow-light">
                    <FontAwesome5 name="lock" size={14} />
                  </Text>
                )}
              </View>
            </View>

            <View className="flex flex-row items-center space-x-1">
              {!post.is_deleted && !post.is_flagged && !post.is_blocked && (
                <Pressable
                  className="rounded-lg p-2 active:bg-gray-200"
                  onPress={handleEllipsisButtonPress}
                >
                  <Text className="text-gray-light">
                    <FontAwesome5 name="ellipsis-h" size={18} />
                  </Text>
                </Pressable>
              )}
              <Pressable
                className={clsx(
                  {
                    'bg-pink-light active:opacity-90':
                      post.current_user_vote === 'upvote',
                    'active:bg-gray-200': post.current_user_vote !== 'upvote'
                  },
                  'rounded-lg p-2'
                )}
                onPress={handleUpvoteButtonPress}
              >
                <Text
                  className={clsx({
                    'text-white': post.current_user_vote === 'upvote',
                    'text-gray-light': post.current_user_vote !== 'upvote'
                  })}
                >
                  <FontAwesome5 name="arrow-up" size={18} />
                </Text>
              </Pressable>
              <Pressable
                className={clsx(
                  {
                    'bg-blue-light active:opacity-90':
                      post.current_user_vote === 'downvote',
                    'active:bg-gray-200': post.current_user_vote !== 'downvote'
                  },
                  'rounded-lg p-2'
                )}
                onPress={handleDownvoteButtonPress}
              >
                <Text
                  className={clsx({
                    'text-white': post.current_user_vote === 'downvote',
                    'text-gray-light': post.current_user_vote !== 'downvote'
                  })}
                >
                  <FontAwesome5 name="arrow-down" size={18} />
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    )
  },
  (prevProps, nextProps) =>
    prevProps.post.vote_count === nextProps.post.vote_count &&
    prevProps.post.current_user_vote === nextProps.post.current_user_vote &&
    prevProps.post.comment_count === nextProps.post.comment_count &&
    prevProps.post.is_deleted === nextProps.post.is_deleted &&
    prevProps.post.is_blocked === nextProps.post.is_blocked
)
