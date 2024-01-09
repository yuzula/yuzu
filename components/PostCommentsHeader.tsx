import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { formatDuration } from '../helpers/time'
import { postModel } from '../models/post'
import { PostVoteButton } from './PostVoteButton'

interface PostCommentsHeaderProps {
  post: postModel.Schema
  onReplyButtonPress: () => void
}

export const PostCommentsHeader: FunctionComponent<PostCommentsHeaderProps> =
  memo(({ post, onReplyButtonPress }) => (
    <>
      <View className="w-full border-b border-gray-100">
        <View className="mx-auto w-5/6 space-y-2 py-4">
          <Text
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

          <View className="space-y-1">
            <Text className="font-Poppins_500Medium text-gray-light">
              by{' '}
              <Text
                className={clsx('font-Poppins_600SemiBold', {
                  'text-gray-light': post.is_deleted || post.is_blocked
                })}
              >
                {post.is_deleted
                  ? 'Deleted'
                  : post.is_blocked
                    ? 'Blocked'
                    : post.username}
              </Text>{' '}
              in{' '}
              <Text className="font-Poppins_600SemiBold">
                @{post.community_domain_name}
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
        </View>
      </View>
      <View className="border-b border-gray-100">
        <View className="mx-auto w-5/6 flex-row justify-between py-2">
          <PostVoteButton post={post} size={18} variant="upvote" />
          <PostVoteButton post={post} size={18} variant="downvote" />
          <Pressable
            className="rounded-lg p-2 active:bg-gray-200"
            onPress={onReplyButtonPress}
          >
            <Text className="text-gray-light">
              <FontAwesome5 name="comment" size={18} />
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  ))
