import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent } from 'react'
import { Pressable, Text, View } from 'react-native'

import { formatDuration } from '../helpers/time'

interface CommentProps {
  id: number
  username?: string
  voteCount: number
  createdAt: Date
  isDeleted: boolean
  isFlagged: boolean
  content?: string
  currentUserVote?: 'upvote' | 'downvote'
  variant?: 'parent' | 'child'
  onEllipsisButtonPress?: (id: number) => void
  onReplyButtonPress?: (id: number) => void
  onUpvoteButtonPress?: (id: number) => void
  onDownvoteButtonPress?: (id: number) => void
}

export const Comment: FunctionComponent<CommentProps> = ({
  id,
  username,
  voteCount,
  createdAt,
  content,
  currentUserVote,
  variant = 'parent',
  isDeleted,
  isFlagged,
  onEllipsisButtonPress,
  onReplyButtonPress,
  onUpvoteButtonPress,
  onDownvoteButtonPress
}) => (
  <View
    className={clsx(
      {
        'pl-6 bg-gray-100': variant === 'child'
      },
      'space-y-1 py-2'
    )}
  >
    <View className="mx-auto w-5/6 flex-row items-center justify-between">
      <View className="flex-row items-center space-x-2">
        <Text
          className={clsx('font-Poppins_600SemiBold', {
            'font-Poppins_600SemiBold_Italic text-gray-light': !username
          })}
        >
          {!username ? 'Deleted' : username}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-gray-light">
            <FontAwesome5 name="arrow-up" size={14} />
          </Text>
          <Text className="font-Poppins_500Medium text-gray-light">
            &nbsp;
            {voteCount}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-1">
        <Pressable
          className="rounded-lg p-2 active:bg-gray-200"
          onPress={() => onEllipsisButtonPress?.(id)}
        >
          <Text className="text-gray-light">
            <FontAwesome5 name="ellipsis-h" size={14} />
          </Text>
        </Pressable>
        <Text className="font-Poppins_500Medium text-gray-light">
          {formatDuration(Date.now() - createdAt.getTime())}
        </Text>
      </View>
    </View>

    <View className="mx-auto w-5/6">
      <Text
        className={clsx('font-Poppins_500Medium', {
          'font-Poppins_500Medium_Italic text-gray-light':
            isDeleted || isFlagged
        })}
      >
        {isDeleted ? 'Deleted' : isFlagged ? 'Flagged' : content}
      </Text>
    </View>

    <View className="mx-auto w-5/6 flex-row items-center justify-end space-x-1">
      {variant === 'parent' && (
        <Pressable
          className="rounded-lg p-2 active:bg-gray-200"
          onPress={() => onReplyButtonPress?.(id)}
        >
          <Text className="text-gray-light">
            <FontAwesome5 name="reply" size={14} />
            &nbsp;
            <Text className="font-Poppins_500Medium">Reply</Text>
          </Text>
        </Pressable>
      )}
      <Pressable
        className={clsx(
          {
            'bg-pink-light active:opacity-90': currentUserVote === 'upvote',
            'active:bg-gray-200': currentUserVote !== 'upvote'
          },
          'rounded-lg p-2'
        )}
        onPress={() => onUpvoteButtonPress?.(id)}
      >
        <Text
          className={clsx({
            'text-white': currentUserVote === 'upvote',
            'text-gray-light': currentUserVote !== 'upvote'
          })}
        >
          <FontAwesome5 name="arrow-up" size={14} />
        </Text>
      </Pressable>
      <Pressable
        className={clsx(
          {
            'bg-blue-light active:opacity-90': currentUserVote === 'downvote',
            'active:bg-gray-200': currentUserVote !== 'downvote'
          },
          'rounded-lg p-2'
        )}
        onPress={() => onDownvoteButtonPress?.(id)}
      >
        <Text
          className={clsx({
            'text-white': currentUserVote === 'downvote',
            'text-gray-light': currentUserVote !== 'downvote'
          })}
        >
          <FontAwesome5 name="arrow-down" size={14} />
        </Text>
      </Pressable>
    </View>
  </View>
)
