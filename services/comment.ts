import { supabase } from '../clients/supabase'
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
