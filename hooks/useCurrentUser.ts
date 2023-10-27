import { AuthError, User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { supabase } from '../clients/supabase'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import * as userService from '../services/user'

const useCurrentUser = () => {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    ;(async () => {
      try {
        setUser(await userService.getCurrentUser())
      } catch (error) {
        if (error instanceof AuthError) {
          if (error.status === 404) {
            await supabase.auth.signOut()
            return
          }
        }

        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    })()
  }, [])

  return user
}

export default useCurrentUser
