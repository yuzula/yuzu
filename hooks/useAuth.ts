import { useContext } from 'react'

import AuthContextProvider, { AuthContext } from '../contexts/AuthContext'
import HookOutOfProviderError from '../errors/HookOutOfProviderError'

const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new HookOutOfProviderError(useAuth.name, AuthContextProvider.name)
  }

  return context
}

export default useAuth
