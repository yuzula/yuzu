import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

import { Database } from '../types/supabase'

export const supabase = createClient<Database>(
  z.string().parse(process.env.SUPABASE_URL),
  z.string().parse(process.env.SUPABASE_KEY),
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)
