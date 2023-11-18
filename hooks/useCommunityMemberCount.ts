import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { communityService } from '../services/community'

export const useCommunityMemberCount = (domainName: string) => {
  const [memberCount, setMemberCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)

      try {
        setMemberCount(await communityService.getMemberCount(domainName))
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [domainName])

  return { memberCount, isLoading }
}
