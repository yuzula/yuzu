import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import Popover from 'react-native-popover-view'

import { POPOVER_VERTICAL_OFFSET } from '../constants/popover'
import { formatDuration } from '../helpers/time'
import { commentModel } from '../models/comment'

interface CommentProps {
  comment: commentModel.Schema
  variant?: 'parent' | 'child'
  communityDomainName: string
  isPostPrivate: boolean
  isAuthorInternal: boolean
  onPress?: (id: number) => void
  onEllipsisButtonPress?: (id: number) => void
  onReplyButtonPress?: (id: number) => void
  onUpvoteButtonPress?: (id: number) => void
  onDownvoteButtonPress?: (id: number) => void
}

export const Comment: FunctionComponent<CommentProps> = memo(
  ({
    comment,
    variant = 'parent',
    communityDomainName,
    isPostPrivate,
    isAuthorInternal,
    onPress,
    onEllipsisButtonPress,
    onReplyButtonPress,
    onUpvoteButtonPress,
    onDownvoteButtonPress
  }) => (
    <Pressable
      className={clsx(
        {
          'pl-6': variant === 'child',
          'active:bg-gray-200': !!onPress
        },
        'space-y-1 py-2'
      )}
      onPress={() => onPress?.(comment.id)}
    >
      <View className="mx-auto w-5/6 flex-row items-center justify-between space-x-2">
        <View className="shrink flex-row items-center space-x-2">
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            className={clsx('shrink font-Poppins_600SemiBold', {
              'font-Poppins_600SemiBold_Italic text-gray-light':
                !comment.username
            })}
          >
            {!comment.username ? 'Deleted' : comment.username}
          </Text>
          {!isPostPrivate && isAuthorInternal && (
            <View>
              <Popover
                verticalOffset={POPOVER_VERTICAL_OFFSET}
                from={
                  <Pressable>
                    <Text className=" text-gray-light">
                      <FontAwesome5 name="users" size={14} />
                    </Text>
                  </Pressable>
                }
              >
                <View className="space-y-2 p-4">
                  <Text className="font-Poppins_600SemiBold text-base">
                    Community members
                  </Text>
                  <Text className="font-Poppins_500Medium">
                    Members of the{' '}
                    <Text className="font-Poppins_600SemiBold">
                      @{communityDomainName}
                    </Text>{' '}
                    community are marked with the{'  '}
                    <FontAwesome5 name="users" />
                    {'  '}icon.
                  </Text>
                </View>
              </Popover>
            </View>
          )}
          <View className="flex-row items-center">
            <Text className="text-gray-light">
              <FontAwesome5 name="arrow-up" size={14} />
            </Text>
            <Text className="font-Poppins_500Medium text-gray-light">
              {' '}
              {comment.vote_count}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-1">
          <Pressable
            className="rounded-lg p-2 active:bg-gray-200"
            onPress={() => onEllipsisButtonPress?.(comment.id)}
          >
            <Text className="text-gray-light">
              <FontAwesome5 name="ellipsis-h" size={14} />
            </Text>
          </Pressable>
          <Text className="font-Poppins_500Medium text-gray-light">
            {formatDuration(Date.now() - comment.created_at.getTime())}
          </Text>
        </View>
      </View>

      <View className="mx-auto w-5/6">
        <Text
          className={clsx('font-Poppins_500Medium', {
            'font-Poppins_500Medium_Italic text-gray-light':
              comment.is_deleted || comment.is_flagged
          })}
        >
          {comment.is_deleted
            ? 'Deleted'
            : comment.is_flagged
            ? 'Flagged'
            : comment.content}
        </Text>
      </View>

      <View className="mx-auto w-5/6 flex-row items-center justify-between">
        <View className="shrink flex-row">
          {comment.comment_count > 0 && (
            <Text
              className="font-Poppins_500Medium text-gray-light"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {comment.comment_count}{' '}
              {comment.comment_count > 1 ? 'replies' : 'reply'}
            </Text>
          )}
        </View>
        <View className="flex-row items-center space-x-1">
          <Pressable
            className="rounded-lg p-2 active:bg-gray-200"
            onPress={() => onReplyButtonPress?.(comment.id)}
          >
            <Text className="text-gray-light">
              <FontAwesome5 name="comment" size={14} />
            </Text>
          </Pressable>
          <Pressable
            className={clsx(
              {
                'bg-pink-light active:opacity-90':
                  comment.current_user_vote === 'upvote',
                'active:bg-gray-200': comment.current_user_vote !== 'upvote'
              },
              'rounded-lg p-2'
            )}
            onPress={() => onUpvoteButtonPress?.(comment.id)}
          >
            <Text
              className={clsx({
                'text-white': comment.current_user_vote === 'upvote',
                'text-gray-light': comment.current_user_vote !== 'upvote'
              })}
            >
              <FontAwesome5 name="arrow-up" size={14} />
            </Text>
          </Pressable>
          <Pressable
            className={clsx(
              {
                'bg-blue-light active:opacity-90':
                  comment.current_user_vote === 'downvote',
                'active:bg-gray-200': comment.current_user_vote !== 'downvote'
              },
              'rounded-lg p-2'
            )}
            onPress={() => onDownvoteButtonPress?.(comment.id)}
          >
            <Text
              className={clsx({
                'text-white': comment.current_user_vote === 'downvote',
                'text-gray-light': comment.current_user_vote !== 'downvote'
              })}
            >
              <FontAwesome5 name="arrow-down" size={14} />
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  ),
  (prevProps, nextProps) =>
    prevProps.comment.vote_count === nextProps.comment.vote_count &&
    prevProps.comment.current_user_vote ===
      nextProps.comment.current_user_vote &&
    prevProps.comment.comment_count === nextProps.comment.comment_count &&
    prevProps.comment.is_deleted === nextProps.comment.is_deleted
)
