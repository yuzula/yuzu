import { createContext, FunctionComponent, PropsWithChildren } from 'react'

import useRouteGuard from '../hooks/useRouteGuard'
import useSession from '../hooks/useSession'

export const AuthContext = createContext<null>(null)

const AuthContextProvider: FunctionComponent<PropsWithChildren> = ({
  children
}) => {
  const { session } = useSession()

  useRouteGuard({ isAuthenticated: !!session })

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
