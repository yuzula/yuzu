import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { communityModel } from '../models/community'

const PAGE_SIZE = 10

interface SearchParams {
  query: string
  fetchedDomainNames: string[]
}

export const search = async ({ query, fetchedDomainNames }: SearchParams) => {
  const response = await supabase
    .rpc('search_communities', { query })
    .not('domain_name', 'in', `(${fetchedDomainNames.join(',')})`)
    .limit(PAGE_SIZE + 1)

  if (response.error) {
    throw response.error
  }

  return {
    communities: communityModel.schema
      .array()
      .parse(response.data.slice(0, PAGE_SIZE)),
    hasNextPage: response.data.length === PAGE_SIZE + 1
  }
}

export const getMemberCount = async (domainName: string) => {
  const response = await supabase.rpc('count_community_members', {
    domain_name: domainName
  })

  if (response.error) {
    throw response.error
  }

  return z.number().parse(response.data)
}

export * as communityService from './community'
