import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { formatDuration } from '../helpers/time'
import { getResultingVote } from '../helpers/vote'
import { useVoteComment } from '../hooks/useVoteComment'
import { commentModel } from '../models/comment'
import { postModel } from '../models/post'
import { Vote } from '../types/vote'

interface CommentCommentsHeaderProps {
  post: postModel.Schema
  comment: commentModel.Schema
  onReplyButtonPress: () => void
}

export const CommentCommentsHeader: FunctionComponent<
  CommentCommentsHeaderProps
> = ({ post, comment, onReplyButtonPress }) => {
  const { mutate: voteComment, error: voteCommentError } = useVoteComment()

  useEffect(() => {
    if (voteCommentError) {
      Alert.alert('Could not vote on comment', GENERIC_ERROR_MESSAGE)
    }
  }, [voteCommentError])

  const handleCommentVoteButtonPress = useCallback(
    ({ oldVote, vote }: { oldVote?: Vote; vote: Vote }) => {
      const { newVote, delta } = getResultingVote({ oldVote, vote })

      voteComment({ commentId: comment.id, vote: newVote, delta })
    },
    [comment.id, voteComment]
  )

  return (
    <>
      <View className="w-full border-b border-gray-100">
        <View className="mx-auto w-5/6 space-y-2 py-4">
          <Text
            className={clsx('font-Poppins_600SemiBold text-base', {
              'font-Poppins_600SemiBold_Italic text-gray-light':
                comment.is_deleted || comment.is_flagged
            })}
          >
            {comment.is_deleted
              ? 'Deleted'
              : comment.is_flagged
              ? 'Flagged'
              : comment.content}
          </Text>

          <View className="space-y-1">
            <Text className="font-Poppins_500Medium text-gray-light">
              by{' '}
              <Text
                className={clsx('font-Poppins_600SemiBold', {
                  'font-Poppins_600SemiBold_Italic text-gray-light':
                    comment.is_deleted
                })}
              >
                {comment.is_deleted ? 'Deleted' : comment.username}
              </Text>{' '}
              in{' '}
              <Text className="font-Poppins_600SemiBold">
                @{post.community_domain_name}
              </Text>
            </Text>

            <View className="flex flex-row items-center space-x-2">
              <Text className="font-Poppins_500Medium text-gray-light">
                <FontAwesome5 name="arrow-up" size={14} /> {comment.vote_count}
              </Text>
              <Text className="font-Poppins_500Medium text-gray-light">
                <FontAwesome5 name="comment" size={14} />{' '}
                {comment.comment_count}
              </Text>
              <Text className="font-Poppins_500Medium text-gray-light">
                <FontAwesome5 name="clock" size={14} />{' '}
                {formatDuration(Date.now() - comment.created_at.getTime())}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="border-b border-gray-100">
        <View className="mx-auto w-5/6 flex-row justify-between py-2">
          <Pressable
            className={clsx(
              {
                'bg-pink-light active:opacity-90':
                  comment.current_user_vote === 'upvote',
                'active:bg-gray-200': comment.current_user_vote !== 'upvote'
              },
              'rounded-lg p-2'
            )}
            onPress={() =>
              handleCommentVoteButtonPress({
                oldVote: comment.current_user_vote,
                vote: 'upvote'
              })
            }
          >
            <Text
              className={clsx({
                'text-white': comment.current_user_vote === 'upvote',
                'text-gray-light': comment.current_user_vote !== 'upvote'
              })}
            >
              <FontAwesome5 name="arrow-up" size={18} />
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
            onPress={() =>
              handleCommentVoteButtonPress({
                oldVote: comment.current_user_vote,
                vote: 'downvote'
              })
            }
          >
            <Text
              className={clsx({
                'text-white': comment.current_user_vote === 'downvote',
                'text-gray-light': comment.current_user_vote !== 'downvote'
              })}
            >
              <FontAwesome5 name="arrow-down" size={18} />
            </Text>
          </Pressable>
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
  )
}
