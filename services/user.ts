import { retryDecorator } from 'ts-retry-promise'

import { supabase } from '../clients/supabase'

export const getCurrentUser = retryDecorator(async () => {
  const response = await supabase.auth.getUser()

  if (response.error) {
    throw response.error
  }

  return response.data.user
})

export const deleteCurrentUser = retryDecorator(async () => {
  const currentUser = await getCurrentUser()

  const response = await supabase
    .from('profiles')
    .delete()
    .eq('id', currentUser.id)

  if (response.error) {
    throw response.error
  }
})

export const logOut = retryDecorator(async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
})

export * as userService from './user'
