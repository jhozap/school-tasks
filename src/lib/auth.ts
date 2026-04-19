import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// Uses getSession() (cookie read, no network call) instead of getUser() (Auth API call).
// Safe because Next.js middleware already calls getUser() to validate/refresh the JWT
// before this render runs. RLS on every Supabase query provides the security guarantee.
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
})
