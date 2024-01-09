import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text } from 'react-native'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { getResultingVote } from '../helpers/vote'
import { useVoteComment } from '../hooks/useVoteComment'
import { commentModel } from '../models/comment'
import { Vote } from '../types/vote'

interface CommentVoteButtonProps {
  comment: commentModel.Schema
  variant: Vote
  size?: number
}

export const CommentVoteButton: FunctionComponent<CommentVoteButtonProps> =
  memo(({ comment, variant, size = 14 }) => {
    const { mutate: voteComment, error: voteCommentError } = useVoteComment({
      commentId: comment.id
    })

    useEffect(() => {
      if (voteCommentError) {
        Alert.alert('Could not vote on comment', GENERIC_ERROR_MESSAGE)
      }
    }, [voteCommentError])

    const handlePress = useCallback(() => {
      const { newVote, delta } = getResultingVote({
        oldVote: comment.current_user_vote,
        vote: variant
      })

      voteComment({ vote: newVote, delta })
    }, [comment.current_user_vote, variant, voteComment])

    return (
      <Pressable
        className={clsx(
          {
            'bg-pink-light':
              variant === 'upvote' && comment.current_user_vote === 'upvote',
            'bg-blue-light':
              variant === 'downvote' &&
              comment.current_user_vote === 'downvote',
            'active:opacity-90': comment.current_user_vote === variant,
            'active:bg-gray-200': comment.current_user_vote !== variant
          },
          'rounded-lg p-2'
        )}
        onPress={handlePress}
      >
        <Text
          className={clsx({
            'text-white': comment.current_user_vote === variant,
            'text-gray-light': comment.current_user_vote !== variant
          })}
        >
          <FontAwesome5
            name={variant === 'upvote' ? 'arrow-up' : 'arrow-down'}
            size={size}
          />
        </Text>
      </Pressable>
    )
  })
