import { supabase } from '../../clients/supabase'
import { getResultingVote } from '../../helpers/vote'

interface GetPostVotesParams {
  postId: number
  userId: string
}

export const getPostVote = async ({ postId, userId }: GetPostVotesParams) => {
  const response = await supabase
    .from('post_votes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (response.error) {
    throw response.error
  }

  return response.data
}

interface VoteParams {
  postId: number
  userId: string
  oldVote: 'upvote' | 'downvote' | null
  vote: 'upvote' | 'downvote'
}

export const registerPostVote = async ({
  postId,
  userId,
  oldVote,
  vote
}: VoteParams) => {
  const resultingVote = getResultingVote({ oldVote, vote })

  const existingVoteResponse = await supabase
    .from('post_votes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingVoteResponse.error) {
    throw existingVoteResponse.error
  }
  // User has voted on this post already
  if (existingVoteResponse.data) {
    // The new vote results in an upvote or downvote
    if (resultingVote.newVote) {
      const response = await supabase
        .from('post_votes')
        .update({ is_upvote: resultingVote.newVote === 'upvote' })
        .eq('id', existingVoteResponse.data.id)

      if (response.error) {
        throw response.error
      }
      // The new vote is cancelling the old vote
    } else {
      const response = await supabase
        .from('post_votes')
        .delete()
        .eq('id', existingVoteResponse.data.id)

      if (response.error) {
        throw response.error
      }
    }
    // The user hasn't voted on this post yet
  } else {
    const response = await supabase.from('post_votes').insert({
      user_id: userId,
      post_id: postId,
      is_upvote: resultingVote.newVote === 'upvote'
    })

    if (response.error) {
      throw response.error
    }
  }
}
