import { Session, User } from '@supabase/supabase-js'
import { createContext, FunctionComponent, PropsWithChildren } from 'react'

export interface AuthContextValues {
  user?: User
  session?: Session
}

export const AuthContext = createContext<AuthContextValues | null>(null)

interface AuthContextProviderProps extends PropsWithChildren {
  session?: Session
}

const AuthContextProvider: FunctionComponent<AuthContextProviderProps> = ({
  session,
  children
}) => (
  <AuthContext.Provider value={{ session, user: session?.user }}>
    {children}
  </AuthContext.Provider>
)

export default AuthContextProvider
