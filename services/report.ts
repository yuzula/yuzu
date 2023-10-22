import { supabase } from '../clients/supabase'

export const reportPost = async (postId: number) => {
  const response = await supabase
    .from('reported_posts')
    .insert({ post_id: postId })

  if (response.error) {
    throw response.error
  }
}
