import { useContext } from 'react'

import ProfileContextProvider, {
  ProfileContext
} from '../contexts/ProfileContext'
import HookOutOfProviderError from '../errors/HookOutOfProviderError'

const useProfileContext = () => {
  const context = useContext(ProfileContext)

  if (!context) {
    throw new HookOutOfProviderError(
      useProfileContext.name,
      ProfileContextProvider.name
    )
  }

  return context
}

export default useProfileContext
