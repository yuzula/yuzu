import { supabase } from '../clients/supabase'

interface ReportPostParams {
  postId: number
  reporterId: string
}

export const reportPost = async ({ postId, reporterId }: ReportPostParams) => {
  const response = await supabase
    .from('reported_posts')
    .insert({ post_id: postId, reporter_id: reporterId })

  if (response.error) {
    throw response.error
  }
}
