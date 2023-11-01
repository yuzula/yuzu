import { AuthError, Session, User } from '@supabase/supabase-js'
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState
} from 'react'
import * as Sentry from 'sentry-expo'

import { supabase } from '../clients/supabase'

export interface AuthContextValues {
  user?: User
  session?: Session
  isLoading: boolean
  error?: AuthError
}

export const AuthContext = createContext<AuthContextValues | null>(null)

const AuthContextProvider: FunctionComponent<PropsWithChildren> = ({
  children
}) => {
  const [session, setSession] = useState<Session>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError>()

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)

      const result = await supabase.auth.getSession()

      if (result.error) {
        Sentry.Native.captureException(result.error)

        setError(result.error)
      } else {
        setSession(result.data.session ?? undefined)
      }

      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? undefined)
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
