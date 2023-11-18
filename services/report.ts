import { retryDecorator } from 'ts-retry-promise'

import { supabase } from '../clients/supabase'

export const reportPost = retryDecorator(async (postId: number) => {
  const response = await supabase
    .from('reported_posts')
    .insert({ post_id: postId })

  if (response.error) {
    throw response.error
  }
})

export const reportComment = retryDecorator(async (commentId: number) => {
  const response = await supabase
    .from('reported_comments')
    .insert({ comment_id: commentId })

  if (response.error) {
    throw response.error
  }
})

export * as reportService from './report'
