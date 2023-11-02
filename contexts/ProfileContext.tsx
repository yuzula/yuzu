import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState
} from 'react'
import * as Sentry from 'sentry-expo'

import { retryPromise } from '../helpers/promise'
import { useAuthContext } from '../hooks/useAuthContext'
import { profileModel } from '../models/profile'
import { profileService } from '../services/profile'

export interface ProfileContextValues {
  profile?: profileModel.Schema
  isLoading: boolean
  error?: Error
}

export const ProfileContext = createContext<ProfileContextValues | null>(null)

export const ProfileContextProvider: FunctionComponent<PropsWithChildren> = ({
  children
}) => {
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const [profile, setProfile] = useState<profileModel.Schema>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    ;(async () => {
      if (isAuthLoading) {
        return
      }

      if (user) {
        try {
          setProfile(await retryPromise(() => profileService.get(user.id)))
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
  }, [isAuthLoading, user])

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </ProfileContext.Provider>
  )
}
