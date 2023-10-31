import { AuthUser } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import * as Sentry from 'sentry-expo'

import * as profileModel from '../models/profile'
import * as profileService from '../services/profile'

const useProfile = (user?: AuthUser) => {
  const [profile, setProfile] = useState<profileModel.Schema>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    ;(async () => {
      if (user) {
        try {
          setProfile(await profileService.get(user.id))
        } catch (error) {
          Sentry.Native.captureException(error)

          if (error instanceof Error) {
            setError(error)
          }
        }
      } else {
        setProfile(undefined)
      }

      setIsLoading(false)
    })()
  }, [user])

  return { profile, isLoading, error }
}

export default useProfile
