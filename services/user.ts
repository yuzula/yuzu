import { supabase } from '../clients/supabase'

export const getCurrentUser = async () => {
  const response = await supabase.auth.getUser()

  if (response.error) {
    throw response.error
  }

  return response.data.user
}

export const deleteCurrentUser = async () => {
  const currentUser = await getCurrentUser()

  const response = await supabase
    .from('profiles')
    .delete()
    .eq('id', currentUser.id)

  if (response.error) {
    throw response.error
  }
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
