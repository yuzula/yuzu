import { supabase } from '../../clients/supabase'

export const getPostsWithHotness = async (community_domain_name: string) => {
  const response = await supabase
    .from('posts_with_hotness')
    .select()
    .eq('community_domain_name', community_domain_name)
    .order('hotness', { ascending: false })

  if (response.error) {
    throw response.error
  }

  return response.data
}
