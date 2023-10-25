import { supabase } from '../clients/supabase'

export const reportPost = async (postId: number) => {
  const response = await supabase
    .from('reported_posts')
    .insert({ post_id: postId })

  if (response.error) {
    throw response.error
  }
}

export const reportComment = async (commentId: number) => {
  const response = await supabase
    .from('reported_comments')
    .insert({ comment_id: commentId })

  if (response.error) {
    throw response.error
  }
}
