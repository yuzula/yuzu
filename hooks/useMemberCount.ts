import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { communityService } from '../services/community'
import { useProfileContext } from './useProfileContext'

export const useMemberCount = () => {
  const { profile } = useProfileContext()

  const [memberCount, setMemberCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (!profile) {
        Sentry.Native.captureException(new NotAuthenticatedError())

        return Alert.alert('You are not authenticated', GENERIC_ERROR_MESSAGE)
      }

      setIsLoading(true)

      try {
        setMemberCount(
          await communityService.getMemberCount(profile.community_domain_name)
        )
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [profile])

  return { memberCount, isLoading }
}
