import { supabase } from '../clients/supabase'
import { commentModel } from '../models/comment'
import { Vote } from '../types/vote'

const PAGE_SIZE = 10

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
  fetchedIds: number[]
}

export const getAllChildren = async ({
  commentId,
  fetchedIds
}: GetAllChildrenParams) => {
  const response = await supabase
    .from('post_screen_comments')
    .select('*')
    .is('parent_comment_id', null)
    .eq('post_id', commentId)
    .order('vote_count', { ascending: false })
    .not('id', 'in', `(${fetchedIds.join(',')})`)
    .limit(PAGE_SIZE + 1)

  if (response.error) {
    throw response.error
  }

  return {
    comments: commentModel.schema.array().parse(
      response.data.slice(0, PAGE_SIZE).map(data => ({
        ...data,
        user_id: data.user_id ?? undefined,
        content: data.content ?? undefined,
        current_user_vote: data.current_user_vote ?? undefined
      }))
    ),
    hasNextPage: response.data.length === PAGE_SIZE + 1
  }
}

interface GetAllRootParams {
  postId: number
  fetchedIds: number[]
}

export const getAllRoot = async ({ postId, fetchedIds }: GetAllRootParams) => {
  const response = await supabase
    .from('post_screen_comments')
    .select('*')
    .is('parent_comment_id', null)
    .eq('post_id', postId)
    .order('vote_count', { ascending: false })
    .not('id', 'in', `(${fetchedIds.join(',')})`)
    .limit(PAGE_SIZE + 1)

  if (response.error) {
    throw response.error
  }

  return {
    comments: commentModel.schema.array().parse(
      response.data.slice(0, PAGE_SIZE).map(data => ({
        ...data,
        user_id: data.user_id ?? undefined,
        content: data.content ?? undefined,
        current_user_vote: data.current_user_vote ?? undefined
      }))
    ),
    hasNextPage: response.data.length === PAGE_SIZE + 1
  }
}

export const markAsDeleted = async (id: number) => {
  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) {
    throw error
  }
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
  vote?: Vote
}

export const registerVote = async ({ commentId, userId, vote }: VoteParams) => {
  const existingVote = await getVote({ commentId, userId })

  // User has voted on this comment already
  if (existingVote) {
    // The new vote results in an upvote or downvote
    if (vote) {
      const response = await supabase
        .from('comment_votes')
        .update({ is_upvote: vote === 'upvote' })
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
      is_upvote: vote === 'upvote'
    })

    if (response.error) {
      // `Duplicate key value violates unique constraint` error, happens when users vote, retract
      // their vote, then place the same vote again in rapid succession. For voting purposes
      // we'll just count it as an expected error
      if (response.error.code !== '23505') {
        throw response.error
      }
    }
  }
}

export * as commentService from './comment'
