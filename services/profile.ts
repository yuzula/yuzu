import { supabase } from '../clients/supabase'
import { profileModel } from '../models/profile'

export const get = async (id: string) => {
  const response = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single()

  if (response.error) {
    throw response.error
  }

  return profileModel.schema.parse(response.data)
}

export * as profileService from './profile'
