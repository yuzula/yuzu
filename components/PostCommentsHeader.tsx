import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { useVotePost } from '../hooks/useVotePost'
import { postModel } from '../models/post'
import { Vote } from '../types/vote'

interface PostCommentsHeaderProps {
  post: postModel.Schema
}

export const PostCommentsHeader: FunctionComponent<PostCommentsHeaderProps> = ({
  post
}) => {
  const { mutate: votePost, error: votePostError } = useVotePost()

  useEffect(() => {
    if (votePostError) {
      Alert.alert('Could not vote on post', GENERIC_ERROR_MESSAGE)
    }
  }, [votePostError])

  const handlePostReplyButtonPress = useCallback(() => {}, [])

  const handlePostVoteButtonPress = useCallback(
    async ({
      postId,
      oldVote,
      vote
    }: {
      postId: number
      oldVote?: Vote
      vote: Vote
    }) => {
      const { newVote, delta } = getResultingVote({ oldVote, vote })

      votePost({ postId, vote: newVote, delta })
    },
    [votePost]
  )

  return (
    <>
      <View className="w-full border-b border-gray-200">
        <View className="mx-auto w-5/6 space-y-2 py-4">
          <Text
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

          <View className="space-y-1">
            <Text className="font-Poppins_500Medium text-gray-light">
              by{' '}
              <Text
                className={clsx('font-Poppins_600SemiBold', {
                  'font-Poppins_600SemiBold_Italic text-gray-light':
                    post.is_deleted
                })}
              >
                {post.is_deleted ? 'Deleted' : post.username}
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
      <View className="border-b border-gray-200">
        <View className="mx-auto w-5/6 flex-row justify-between py-2">
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
              handlePostVoteButtonPress({
                postId: post.id,
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
              handlePostVoteButtonPress({
                postId: post.id,
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
          <Pressable
            className="rounded-lg p-2 active:bg-gray-200"
            onPress={handlePostReplyButtonPress}
          >
            <Text className="text-gray-light">
              <FontAwesome5 name="comment" size={18} />
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  )
}
