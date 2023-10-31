import { useContext } from 'react'

import AuthContextProvider, { AuthContext } from '../contexts/AuthContext'
import HookOutOfProviderError from '../errors/HookOutOfProviderError'

const useAuthContext = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new HookOutOfProviderError(
      useAuthContext.name,
      AuthContextProvider.name
    )
  }

  return context
}

export default useAuthContext
