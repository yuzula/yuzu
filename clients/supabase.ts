import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

import { Database } from '../types/supabase'

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL || 'https://sgqmlhvwdcvykcrgjnbk.supabase.co',
  process.env.SUPABASE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncW1saHZ3ZGN2eWtjcmdqbmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcxMDU5NDMsImV4cCI6MjAxMjY4MTk0M30.2fRJPZqnEHYrOWP7rvaNq0rk8kGZDJpwhXRc39QjuOE',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)
