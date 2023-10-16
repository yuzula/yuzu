import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const supabase = createClient(
  z.string().parse(process.env.EXPO_PUBLIC_SUPABASE_URL),
  z.string().parse(process.env.EXPO_PUBLIC_ANON_KEY),
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)
