import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState
} from 'react'
import * as Sentry from 'sentry-expo'

import useAuthContext from '../hooks/useAuthContext'
import { profileModel } from '../models/profile'
import { profileService } from '../services/profile'

export interface ProfileContextValues {
  profile?: profileModel.Schema
  isLoading: boolean
  error?: Error
}

export const ProfileContext = createContext<ProfileContextValues | null>(null)

const ProfileContextProvider: FunctionComponent<PropsWithChildren> = ({
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
  }, [isAuthLoading, user])

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </ProfileContext.Provider>
  )
}

export default ProfileContextProvider
