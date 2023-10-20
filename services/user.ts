import { supabase } from '../clients/supabase'

export const getCurrentUser = async () => {
  const response = await supabase.auth.getUser()

  if (response.error) {
    throw response.error
  }

  return response.data.user
}
