import { supabase } from '../clients/supabase'
import { getResultingVote } from '../helpers/vote'
import * as commentModel from '../models/comment'

interface CreateParams {
  postId: number
  userId: string
  content: string
  parentCommentId?: number
}

export const create = async ({
  postId,
  userId,
  content,
  parentCommentId
}: CreateParams) => {
  const response = await supabase.from('comments').insert({
    post_id: postId,
    user_id: userId,
    parent_comment_id: parentCommentId,
    content
  })

  if (response.error) {
    throw response.error
  }
}

interface GetAllChildrenParams {
  commentId: number
  userId: string
}

const getAllChildren = async ({ commentId, userId }: GetAllChildrenParams) => {
  const response = await supabase
    .from('comments_with_vote_count')
    .select('*, comment_votes(user_id, is_upvote), profiles(username)')
    .eq('parent_comment_id', commentId)
    .eq('comment_votes.user_id', userId)
    .order('vote_count', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return commentModel.baseSchema.array().parse(
    response.data.map(data => ({
      ...data,
      username: data.profiles?.username,
      parent_comment_id: commentId,
      current_user_vote: !data.comment_votes[0]
        ? undefined
        : data.comment_votes[0].is_upvote
        ? 'upvote'
        : 'downvote'
    }))
  )
}

interface GetAllRootParams {
  postId: number
  userId: string
}

export const getAllRoot = async ({ postId, userId }: GetAllRootParams) => {
  const response = await supabase
    .from('comments_with_vote_count')
    .select('*, comment_votes(user_id, is_upvote), profiles(username)')
    .is('parent_comment_id', null)
    .eq('post_id', postId)
    .eq('comment_votes.user_id', userId)
    .order('vote_count', { ascending: false })

  if (response.error) {
    throw response.error
  }

  const rootComments = commentModel.baseSchema.array().parse(
    response.data.map(data => ({
      ...data,
      username: data.profiles?.username,
      parent_comment_id: undefined,
      current_user_vote: !data.comment_votes[0]
        ? undefined
        : data.comment_votes[0].is_upvote
        ? 'upvote'
        : 'downvote'
    }))
  )

  return commentModel.schema.array().parse(
    await Promise.all(
      rootComments.map(async comment => ({
        ...comment,
        children: await getAllChildren({ commentId: comment.id, userId })
      }))
    )
  )
}

interface GetPostVotesParams {
  commentId: number
  userId: string
}

export const getVote = async ({ commentId, userId }: GetPostVotesParams) => {
  const response = await supabase
    .from('comment_votes')
    .select()
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (response.error) {
    throw response.error
  }

  return response.data
}

interface VoteParams {
  commentId: number
  userId: string
  oldVote?: 'upvote' | 'downvote'
  vote: 'upvote' | 'downvote'
}

export const registerVote = async ({
  commentId,
  userId,
  oldVote,
  vote
}: VoteParams) => {
  const resultingVote = getResultingVote({ oldVote, vote })

  const existingVote = await getVote({ commentId, userId })

  // User has voted on this comment already
  if (existingVote) {
    // The new vote results in an upvote or downvote
    if (resultingVote.newVote) {
      const response = await supabase
        .from('comment_votes')
        .update({ is_upvote: resultingVote.newVote === 'upvote' })
        .eq('id', existingVote.id)

      if (response.error) {
        throw response.error
      }
      // The new vote is cancelling the old vote
    } else {
      const response = await supabase
        .from('comment_votes')
        .delete()
        .eq('id', existingVote.id)

      if (response.error) {
        throw response.error
      }
    }
    // The user hasn't voted on this comment yet
  } else {
    const response = await supabase.from('comment_votes').insert({
      user_id: userId,
      comment_id: commentId,
      is_upvote: resultingVote.newVote === 'upvote'
    })

    if (response.error) {
      throw response.error
    }
  }
}
