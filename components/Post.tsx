import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent } from 'react'
import { Pressable, Text, View } from 'react-native'

import { formatDuration } from '../helpers/time'
import { postModel } from '../models/post'
import { Vote } from '../types/vote'

interface PostProps {
  post: postModel.Schema
  onPress: (post: postModel.Schema) => void
  onVoteButtonPress: (params: {
    post: postModel.Schema
    oldVote?: Vote
    vote: Vote
  }) => void
  onEllipsisButtonPress: (post: postModel.Schema) => void
}

export const Post: FunctionComponent<PostProps> = ({
  post,
  onPress,
  onVoteButtonPress,
  onEllipsisButtonPress
}) => (
  <Pressable className="active:bg-gray-200" onPress={() => onPress(post)}>
    <View className="mx-auto w-5/6 space-y-2 py-4">
      <Text
        ellipsizeMode="tail"
        numberOfLines={4}
        className={clsx('font-Poppins_600SemiBold text-base', {
          'font-Poppins_600SemiBold_Italic text-gray-light':
            post.is_deleted || post.is_flagged
        })}
      >
        {post.is_deleted
          ? 'Deleted'
          : post.is_flagged
          ? 'Flagged'
          : post.content}
      </Text>

      <View className="flex flex-row items-center justify-between">
        <View className="space-y-1">
          <Text className="font-Poppins_500Medium text-gray-light">
            by&nbsp;
            <Text
              className={clsx('font-Poppins_600SemiBold', {
                'font-Poppins_600SemiBold_Italic': post.is_deleted
              })}
            >
              {post.is_deleted ? 'Deleted' : post.username}
            </Text>
          </Text>
          <View className="flex flex-row items-center space-x-2">
            <Text className="font-Poppins_500Medium text-gray-light">
              <FontAwesome5 name="arrow-up" size={14} />
              &nbsp;{post.vote_count}
            </Text>
            <Text className="font-Poppins_500Medium text-gray-light">
              <FontAwesome5 name="comment-dots" size={14} />
              &nbsp;{post.comment_count}
            </Text>
            <Text className="font-Poppins_500Medium text-gray-light">
              <FontAwesome5 name="clock" size={14} />
              &nbsp;
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
            onPress={() => onEllipsisButtonPress(post)}
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
            onPress={() =>
              onVoteButtonPress({
                post,
                oldVote: post.current_user_vote,
                vote: 'upvote'
              })
            }
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
            onPress={() =>
              onVoteButtonPress({
                post,
                oldVote: post.current_user_vote,
                vote: 'downvote'
              })
            }
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
