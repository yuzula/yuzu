import { useQuery } from '@tanstack/react-query'

import { communityService } from '../services/community'

export const useCommunityMemberCount = (domainName: string) =>
  useQuery({
    queryKey: ['community', domainName, 'members', 'count'],
    queryFn: () => communityService.getMemberCount(domainName)
  })
