import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { Vote } from '../types/vote'

interface PostProps {
  id: number
  isDeleted: boolean
  isFlagged: boolean
  isPrivate: boolean
  authorId?: string
  authorUsername?: string
  communityDomainName?: string
  voteCount: number
  commentCount: number
  content?: string
  currentUserVote?: Vote
  createdAt: Date
  onPress: (postId: number) => void
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
    id,
    isDeleted,
    isFlagged,
    isPrivate,
    authorUsername,
    communityDomainName,
    authorId,
    voteCount,
    commentCount,
    content,
    currentUserVote,
    createdAt,
    onPress,
    onVoteButtonPress,
    onEllipsisButtonPress,
    onCommunityDomainNamePress
  }) => {
    const handleDomainNamePress = useCallback(() => {
      if (!communityDomainName) {
        Sentry.Native.captureException('communityDomainName is not defined')

        return Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }

      onCommunityDomainNamePress?.(communityDomainName)
    }, [communityDomainName, onCommunityDomainNamePress])

    const handlePress = useCallback(() => {
      onPress(id)
    }, [id, onPress])

    const handleEllipsisButtonPress = useCallback(() => {
      onEllipsisButtonPress({
        postId: id,
        postAuthorId: authorId
      })
    }, [authorId, id, onEllipsisButtonPress])

    const handleUpvoteButtonPress = useCallback(() => {
      onVoteButtonPress({
        postId: id,
        oldVote: currentUserVote,
        vote: 'upvote'
      })
    }, [currentUserVote, id, onVoteButtonPress])

    const handleDownvoteButtonPress = useCallback(() => {
      onVoteButtonPress({
        postId: id,
        oldVote: currentUserVote,
        vote: 'downvote'
      })
    }, [currentUserVote, id, onVoteButtonPress])

    return (
      <Pressable className="active:bg-gray-200" id="BRUH" onPress={handlePress}>
        <View className="mx-auto w-5/6 space-y-2 py-4">
          {communityDomainName && (
            <View className="flex-row">
              <Pressable className="shrink" onPress={handleDomainNamePress}>
                <Text className="font-Poppins_600SemiBold text-gray-light">
                  @{communityDomainName}
                </Text>
              </Pressable>
            </View>
          )}

          <Text
            ellipsizeMode="tail"
            numberOfLines={4}
            className={clsx('font-Poppins_600SemiBold text-base', {
              'font-Poppins_600SemiBold_Italic text-gray-light':
                isDeleted || isFlagged
            })}
          >
            {isDeleted ? 'Deleted' : isFlagged ? 'Flagged' : content}
          </Text>

          <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex-1 space-y-1">
              <Text
                className="shrink font-Poppins_500Medium text-gray-light"
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                by{' '}
                <Text
                  className={clsx('font-Poppins_600SemiBold', {
                    'font-Poppins_600SemiBold_Italic': isDeleted
                  })}
                >
                  {isDeleted ? 'Deleted' : authorUsername}
                </Text>
              </Text>
              <View className="flex flex-row items-center space-x-2">
                <Text className="font-Poppins_500Medium text-gray-light">
                  <FontAwesome5 name="arrow-up" size={14} /> {voteCount}
                </Text>
                <Text className="font-Poppins_500Medium text-gray-light">
                  <FontAwesome5 name="comment" size={14} /> {commentCount}
                </Text>
                <Text className="font-Poppins_500Medium text-gray-light">
                  <FontAwesome5 name="clock" size={14} />{' '}
                  {formatDuration(Date.now() - createdAt.getTime())}
                </Text>
                {isPrivate && (
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
                      currentUserVote === 'upvote',
                    'active:bg-gray-200': currentUserVote !== 'upvote'
                  },
                  'rounded-lg p-2'
                )}
                onPress={handleUpvoteButtonPress}
              >
                <Text
                  className={clsx({
                    'text-white': currentUserVote === 'upvote',
                    'text-gray-light': currentUserVote !== 'upvote'
                  })}
                >
                  <FontAwesome5 name="arrow-up" size={18} />
                </Text>
              </Pressable>
              <Pressable
                className={clsx(
                  {
                    'bg-blue-light active:opacity-90':
                      currentUserVote === 'downvote',
                    'active:bg-gray-200': currentUserVote !== 'downvote'
                  },
                  'rounded-lg p-2'
                )}
                onPress={handleDownvoteButtonPress}
              >
                <Text
                  className={clsx({
                    'text-white': currentUserVote === 'downvote',
                    'text-gray-light': currentUserVote !== 'downvote'
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
    prevProps.voteCount === nextProps.voteCount &&
    prevProps.currentUserVote === nextProps.currentUserVote &&
    prevProps.commentCount === nextProps.commentCount
)
