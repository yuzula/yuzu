import { supabase } from '../clients/supabase'
import { schema } from '../models/profile'

export const get = async (id: string) => {
  const response = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single()

  if (response.error) {
    throw response.error
  }

  return schema.parse(response.data)
}
