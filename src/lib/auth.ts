import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// Deduplicates getUser() across layout + page within the same render.
// React cache() lives only for the duration of a single request.
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
