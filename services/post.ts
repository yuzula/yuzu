import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { postModel } from '../models/post'

interface GetParams {
  postId: number
}

export const get = async ({ postId }: GetParams) => {
  const response = await supabase
    .from('home_screen_posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (response.error) {
    throw response.error
  }

  return postModel.schema.parse({
    ...response.data,
    user_id: response.data.user_id ?? undefined,
    content: response.data.content ?? undefined,
    current_user_vote: response.data.current_user_vote
  })
}

interface GetAllParams {
  communityDomainName: string
  sortBy: 'hot' | 'new' | 'controversial'
  filterBy: 'all' | 'private' | 'public'
}

export const getAll = async ({
  communityDomainName,
  sortBy = 'hot',
  filterBy = 'all'
}: GetAllParams) => {
  const query = supabase
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

  if (filterBy !== 'all') {
    query.eq('is_private', filterBy === 'private')
  }

  // Supabase queries are only executed when `await` or `.then()` is called
  //
  // https://github.com/orgs/supabase/discussions/787#discussioncomment-420451
  // https://github.com/supabase/postgrest-js/blob/2bbc4354ee14895a7eb7b7f4724b8818ab650426/src/lib/types.ts#L61
  const response = await query

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
