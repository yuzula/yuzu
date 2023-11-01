import { useEffect, useState } from 'react'
import * as Sentry from 'sentry-expo'

import * as profileModel from '../models/profile'
import * as profileService from '../services/profile'

const useProfile = (id: string) => {
  const [profile, setProfile] = useState<profileModel.Schema>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    ;(async () => {
      try {
        setProfile(await profileService.get(id))
      } catch (error) {
        Sentry.Native.captureException(error)

        if (error instanceof Error) {
          setError(error)
        }
      }
      setIsLoading(false)
    })()
  }, [id])

  return { profile, isLoading, error }
}

export default useProfile
