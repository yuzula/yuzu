import { useContext } from 'react'

import { AuthContext, AuthContextProvider } from '../contexts/AuthContext'
import { HookOutOfProviderError } from '../errors/HookOutOfProviderError'

export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new HookOutOfProviderError(
      useAuthContext.name,
      AuthContextProvider.name
    )
  }

  return context
}
