import { createContext, FunctionComponent, PropsWithChildren } from 'react'

import * as profileModel from '../models/profile'

export interface ProfileContextValues {
  profile?: profileModel.Schema
}

export const ProfileContext = createContext<ProfileContextValues | null>(null)

interface ProfileContextProviderProps extends PropsWithChildren {
  profile?: profileModel.Schema
}

const ProfileContextProvider: FunctionComponent<
  ProfileContextProviderProps
> = ({ profile, children }) => (
  <ProfileContext.Provider value={{ profile }}>
    {children}
  </ProfileContext.Provider>
)

export default ProfileContextProvider
