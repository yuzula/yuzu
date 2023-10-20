import { supabase } from '../clients/supabase'
import { getResultingVote } from '../helpers/vote'

export const getPostsSortedByHotness = async (
  community_domain_name: string
) => {
  const response = await supabase
    .from('posts_with_hotness')
    .select()
    .eq('community_domain_name', community_domain_name)
    .order('hotness', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return response.data
}

export const getPostsSortedByNew = async (community_domain_name: string) => {
  const response = await supabase
    .from('posts_with_hotness')
    .select()
    .eq('community_domain_name', community_domain_name)
    .order('created_at', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return response.data
}

export const getPostsSortedByCommentCount = async (
  community_domain_name: string
) => {
  const response = await supabase
    .from('posts_with_hotness')
    .select()
    .eq('community_domain_name', community_domain_name)
    .order('comment_count', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return response.data
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
