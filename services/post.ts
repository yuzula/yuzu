import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { postModel } from '../models/post'

interface GetParams {
  postId: number
  userId: string
}

export const get = async ({ postId, userId }: GetParams) => {
  const response = await supabase
    .from('posts_with_vote_and_comment_count')
    .select(
      `
        *,
        post_votes(user_id, is_upvote),
        profiles(username),
        reported_posts(is_flagged)
      `
    )
    .eq('id', postId)
    .eq('post_votes.user_id', userId)
    .single()

  if (response.error) {
    throw response.error
  }

  return postModel.schema.parse({
    ...response.data,
    username: response.data.profiles?.username,
    user_id: response.data.user_id ?? undefined,
    content: response.data.content ?? undefined,
    // @ts-expect-error weird TypeScript error. This is the right type
    is_flagged: !!response.data.reported_posts?.is_flagged,
    current_user_vote: !response.data.post_votes[0]
      ? undefined
      : response.data.post_votes[0].is_upvote
      ? 'upvote'
      : 'downvote'
  })
}

interface GetAllParams {
  communityDomainName: string
  sortBy: 'hot' | 'new' | 'controversial'
}

export const getAll = async ({
  communityDomainName,
  sortBy = 'hot'
}: GetAllParams) => {
  const response = await supabase
    .from('home_screen_posts')
    .select('*')
    .eq('community_domain_name', communityDomainName)
    .eq('is_deleted', false)
    .eq('is_flagged', false)
    .order(
      sortBy === 'hot'
        ? 'hotness'
        : sortBy === 'new'
        ? 'created_at'
        : 'comment_count',
      { ascending: false }
    )
    .limit(40)

  if (response.error) {
    throw response.error
  }

  return postModel.schema.array().parse(
    response.data.map(data => ({
      ...data,
      user_id: data.user_id ?? undefined,
      content: data.content ?? undefined,
      current_user_vote: data.current_user_vote ?? undefined
    }))
  )
}

interface CreateParams {
  communityDomainName: string
  userId: string
  content: string
  isPrivate: boolean
}

export const create = async ({
  communityDomainName,
  userId,
  content,
  isPrivate
}: CreateParams) => {
  const response = await supabase
    .from('posts')
    .insert({
      community_domain_name: communityDomainName,
      content,
      user_id: userId,
      is_private: isPrivate
    })
    .select()

  if (response.error) {
    throw response.error
  }

  return z.number().parse(response.data[0]?.id)
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
  vote?: 'upvote' | 'downvote'
}

export const registerVote = async ({ postId, userId, vote }: VoteParams) => {
  const existingVote = await getVote({ postId, userId })

  // User has voted on this post already
  if (existingVote) {
    // The new vote results in an upvote or downvote
    if (vote) {
      const response = await supabase
        .from('post_votes')
        .update({ is_upvote: vote === 'upvote' })
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
      is_upvote: vote === 'upvote'
    })

    if (response.error) {
      throw response.error
    }
  }
}

export * as postService from './post'
