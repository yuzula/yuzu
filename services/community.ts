import { retryDecorator } from 'ts-retry-promise'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { communityModel } from '../models/community'

export const search = retryDecorator(async (query: string) => {
  const response = await supabase.rpc('search_communities', { query }).limit(20)

  if (response.error) {
    throw response.error
  }

  return communityModel.schema.array().parse(response.data)
})

export const getAll = retryDecorator(async () => {
  const response = await supabase
    .from('communities_with_member_count')
    .select()
    .order('member_count', { ascending: false })
    .limit(20)

  if (response.error) {
    throw response.error
  }

  return communityModel.schema.array().parse(response.data)
})

export const getMemberCount = retryDecorator(async (domainName: string) => {
  const response = await supabase.rpc('count_community_members', {
    domain_name: domainName
  })

  if (response.error) {
    throw response.error
  }

  return z.number().parse(response.data)
})

export * as communityService from './community'
