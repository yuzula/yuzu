import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import Popover from 'react-native-popover-view'

import { MAX_COMMENT_DEPTH } from '../constants/comment'
import { POPOVER_VERTICAL_OFFSET } from '../constants/popover'
import { formatDuration } from '../helpers/time'
import { commentModel } from '../models/comment'
import { CommentEllipsisButton } from './CommentEllipsisButton'
import { CommentVoteButton } from './CommentVoteButton'

interface CommentProps {
  comment: commentModel.Schema
  variant?: 'parent' | 'child'
  communityDomainName: string
  isPostPrivate: boolean
  isAuthorInternal: boolean
  isHeader?: boolean
  onPress?: (id: number) => void
  onReplyButtonPress?: (id: number) => void
}

export const Comment: FunctionComponent<CommentProps> = memo(
  ({
    comment,
    variant = 'parent',
    communityDomainName,
    isPostPrivate,
    isAuthorInternal,
    isHeader = false,
    onPress,
    onReplyButtonPress
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
              'text-gray-light': comment.is_deleted
            })}
          >
            {comment.is_deleted ? 'Deleted' : comment.username}
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
            <Text className="py-2 text-gray-light">
              <FontAwesome5 name="arrow-up" size={14} />
            </Text>
            <Text className="font-Poppins_500Medium text-gray-light">
              {' '}
              {comment.vote_count}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-1">
          {!isHeader &&
            !comment.is_deleted &&
            !comment.is_flagged &&
            !comment.is_blocked && (
              <CommentEllipsisButton
                comment={comment}
                size={14}
                variant="child"
              />
            )}
          <Text className="font-Poppins_500Medium text-gray-light">
            {formatDuration(Date.now() - comment.created_at.getTime())}
          </Text>
        </View>
      </View>

      <View className="mx-auto w-5/6">
        <Text
          className={clsx('font-Poppins_500Medium', {
            'text-gray-light':
              comment.is_deleted || comment.is_flagged || comment.is_blocked
          })}
        >
          {comment.is_deleted
            ? 'This comment has been deleted'
            : comment.is_flagged
              ? 'This comment has been flagged by the community'
              : comment.is_blocked
                ? 'This comment was submitted by a blocked user'
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
          {comment.depth < MAX_COMMENT_DEPTH - 1 && (
            <Pressable
              className="rounded-lg p-2 active:bg-gray-200"
              onPress={() => onReplyButtonPress?.(comment.id)}
            >
              <Text className="text-gray-light">
                <FontAwesome5 name="comment" size={14} />
              </Text>
            </Pressable>
          )}
          <View>
            <CommentVoteButton comment={comment} size={14} variant="upvote" />
          </View>
          <View>
            <CommentVoteButton comment={comment} size={14} variant="downvote" />
          </View>
        </View>
      </View>
    </Pressable>
  ),
  (prevProps, nextProps) =>
    prevProps.comment.vote_count === nextProps.comment.vote_count &&
    prevProps.comment.current_user_vote ===
      nextProps.comment.current_user_vote &&
    prevProps.comment.comment_count === nextProps.comment.comment_count &&
    prevProps.comment.is_deleted === nextProps.comment.is_deleted &&
    prevProps.comment.is_blocked === nextProps.comment.is_blocked
)
