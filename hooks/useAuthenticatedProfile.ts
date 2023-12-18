import * as Sentry from 'sentry-expo'

import { NotAuthenticatedError } from '../errors/NotAuthenticatedError'
import { useProfileContext } from './useProfileContext'

export const useAuthenticatedProfile = () => {
  const { profile } = useProfileContext()

  if (!profile) {
    Sentry.Native.captureException('Profile not defined')

    throw new NotAuthenticatedError()
  }

  return { profile }
}
