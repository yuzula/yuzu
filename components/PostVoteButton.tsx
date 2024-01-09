import { FontAwesome5 } from '@expo/vector-icons'
import clsx from 'clsx'
import React, { FunctionComponent, memo, useCallback, useEffect } from 'react'
import { Alert, Pressable, Text } from 'react-native'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { getResultingVote } from '../helpers/vote'
import { useVotePost } from '../hooks/useVotePost'
import { postModel } from '../models/post'
import { Vote } from '../types/vote'

interface PostVoteButtonProps {
  post: postModel.Schema
  variant: Vote
  size?: number
}

export const PostVoteButton: FunctionComponent<PostVoteButtonProps> = memo(
  ({ post, variant, size = 18 }) => {
    const { mutate: votePost, error: votePostError } = useVotePost({
      postId: post.id
    })

    useEffect(() => {
      if (votePostError) {
        Alert.alert('Could not vote on post', GENERIC_ERROR_MESSAGE)
      }
    }, [votePostError])

    const handlePress = useCallback(() => {
      const { newVote, delta } = getResultingVote({
        oldVote: post.current_user_vote,
        vote: variant
      })

      votePost({ vote: newVote, delta })
    }, [post.current_user_vote, variant, votePost])

    return (
      <Pressable
        className={clsx(
          {
            'bg-pink-light':
              variant === 'upvote' && post.current_user_vote === 'upvote',
            'bg-blue-light':
              variant === 'downvote' && post.current_user_vote === 'downvote',
            'active:opacity-90': post.current_user_vote === variant,
            'active:bg-gray-200': post.current_user_vote !== variant
          },
          'rounded-lg p-2'
        )}
        onPress={handlePress}
      >
        <Text
          className={clsx({
            'text-white': post.current_user_vote === variant,
            'text-gray-light': post.current_user_vote !== variant
          })}
        >
          <FontAwesome5
            name={variant === 'upvote' ? 'arrow-up' : 'arrow-down'}
            size={size}
          />
        </Text>
      </Pressable>
    )
  }
)
