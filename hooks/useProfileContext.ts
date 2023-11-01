import { useContext } from 'react'

import {
  ProfileContext,
  ProfileContextProvider
} from '../contexts/ProfileContext'
import { HookOutOfProviderError } from '../errors/HookOutOfProviderError'

export const useProfileContext = () => {
  const context = useContext(ProfileContext)

  if (!context) {
    throw new HookOutOfProviderError(
      useProfileContext.name,
      ProfileContextProvider.name
    )
  }

  return context
}
