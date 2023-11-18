import { retryDecorator } from 'ts-retry-promise'

import { supabase } from '../clients/supabase'
import { profileModel } from '../models/profile'

export const get = retryDecorator(async (id: string) => {
  const response = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single()

  if (response.error) {
    throw response.error
  }

  return profileModel.schema.parse(response.data)
})

export * as profileService from './profile'
