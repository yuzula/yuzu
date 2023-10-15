import { AuthError, Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../clients/supabase'

const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const doGetSession = useCallback(async () => {
    setIsLoading(true)
    const result = await supabase.auth.getSession()

    if (result.error) {
      setError(result.error)
    } else {
      setSession(result.data.session)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    doGetSession()
  }, [doGetSession])

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return { session, isLoading, error }
}

export default useSession
