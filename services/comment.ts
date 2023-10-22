import { supabase } from '../clients/supabase'

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
