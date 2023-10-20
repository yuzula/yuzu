import { z } from 'zod'

import { supabase } from '../clients/supabase'

export const getMemberCount = async (domainName: string) => {
  const response = await supabase.rpc('count_community_members', {
    domain_name: domainName
  })

  if (response.error) {
    throw response.error
  }

  return z.number().parse(response.data)
}
