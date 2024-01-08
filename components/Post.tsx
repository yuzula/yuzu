import { FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { postModel } from '../models/post'
import { Vote } from '../types/vote'

interface PostProps {
  post: postModel.Schema
  shouldDisplayCommunityDomainName?: boolean
  onVoteButtonPress: ({
    postId,
    oldVote,
    vote
  }: {
    postId: number
    oldVote?: Vote
    vote: Vote
  }) => void
  onEllipsisButtonPress: ({
    postId,
    postAuthorId
  }: {
    postId: number
    postAuthorId?: string
  }) => void
  onCommunityDomainNamePress?: (domainName: string) => void
}

export const Post: FunctionComponent<PostProps> = memo(
  ({
    post,
    shouldDisplayCommunityDomainName = false,
    onVoteButtonPress,
    onEllipsisButtonPress,
    onCommunityDomainNamePress
  }) => {
    const navigation = useNavigation()

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

    const handleEllipsisButtonPress = useCallback(() => {
      onEllipsisButtonPress({
        postId: post.id,
        postAuthorId: post.user_id
      })
    }, [onEllipsisButtonPress, post.id, post.user_id])

    const handleUpvoteButtonPress = useCallback(() => {
      onVoteButtonPress({
        postId: post.id,
        oldVote: post.current_user_vote,
        vote: 'upvote'
      })
    }, [onVoteButtonPress, post.current_user_vote, post.id])

    const handleDownvoteButtonPress = useCallback(() => {
      onVoteButtonPress({
        postId: post.id,
        oldVote: post.current_user_vote,
        vote: 'downvote'
      })
    }, [onVoteButtonPress, post.current_user_vote, post.id])

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
              <Pressable
                className="rounded-lg p-2 active:bg-gray-200"
                onPress={handleEllipsisButtonPress}
              >
                <Text className="text-gray-light">
                  <FontAwesome5 name="ellipsis-h" size={18} />
                </Text>
              </Pressable>
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
