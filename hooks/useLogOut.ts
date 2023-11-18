import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import * as Sentry from 'sentry-expo'

import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { userService } from '../services/user'

export const useLogOut = () => {
  const [isLoading, setIsLoading] = useState(false)

  const logOut = useCallback(async () => {
    setIsLoading(true)

    try {
      await userService.logOut()
    } catch (error) {
      Sentry.Native.captureException(error)

      Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { logOut, isLoading }
}
