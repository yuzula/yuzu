import { retryDecorator } from 'ts-retry-promise'

import { supabase } from '../clients/supabase'

interface BlockUserParams {
  blockerId: string
  blockeeId: string
}

export const blockUser = retryDecorator(
  async ({ blockerId, blockeeId }: BlockUserParams) => {
    const response = await supabase
      .from('blocked_users')
      .insert({ blocker_id: blockerId, blockee_id: blockeeId })

    if (response.error) {
      throw response.error
    }
  }
)

export const unblockUser = retryDecorator(
  async ({ blockerId, blockeeId }: BlockUserParams) => {
    const response = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blockee_id', blockeeId)

    if (response.error) {
      throw response.error
    }
  }
)

export * as blockService from './block'
