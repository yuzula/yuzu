import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import * as userService from '../services/user'

const useCurrentUser = () => {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    ;(async () => {
      try {
        setUser(await userService.getCurrentUser())
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    })()
  }, [])

  return user
}

export default useCurrentUser
