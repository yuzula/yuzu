import { supabase } from '../clients/supabase'
import { getResultingVote } from '../helpers/vote'
import * as postModel from '../models/post'

interface GetSortedPostsParams {
  communityDomainName: string
  sortBy: 'hot' | 'new' | 'controversial'
}

export const getPosts = async ({
  communityDomainName,
  sortBy = 'hot'
}: GetSortedPostsParams) => {
  const response = await supabase
    .from('posts_with_hotness')
    .select()
    .eq('community_domain_name', communityDomainName)
    .order(
      sortBy === 'hot'
        ? 'hotness'
        : sortBy === 'new'
        ? 'created_at'
        : 'comment_count',
      { ascending: false }
    )

  if (response.error) {
    throw response.error
  }

  return postModel.dtoSchema.array().parse(response.data)
}

interface GetPostVotesParams {
  postId: number
  userId: string
}

export const getVote = async ({ postId, userId }: GetPostVotesParams) => {
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

export const registerVote = async ({
  postId,
  userId,
  oldVote,
  vote
}: VoteParams) => {
  const resultingVote = getResultingVote({ oldVote, vote })

  const existingVote = await getVote({ postId, userId })

  // User has voted on this post already
  if (existingVote) {
    // The new vote results in an upvote or downvote
    if (resultingVote.newVote) {
      const response = await supabase
        .from('post_votes')
        .update({ is_upvote: resultingVote.newVote === 'upvote' })
        .eq('id', existingVote.id)

      if (response.error) {
        throw response.error
      }
      // The new vote is cancelling the old vote
    } else {
      const response = await supabase
        .from('post_votes')
        .delete()
        .eq('id', existingVote.id)

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
