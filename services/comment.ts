import { supabase } from '../clients/supabase'

interface CreateParams {
  postId: number
  userId: string
  content: string
  ancestorId?: number
  descendentId?: number
  depth: number
}

export const create = async ({
  postId,
  userId,
  content,
  ancestorId,
  descendentId,
  depth
}: CreateParams) => {
  const response = await supabase.from('comments').insert({
    post_id: postId,
    user_id: userId,
    content,
    ancestor_id: ancestorId,
    descendent_id: descendentId,
    depth
  })

  if (response.error) {
    throw response.error
  }
}
