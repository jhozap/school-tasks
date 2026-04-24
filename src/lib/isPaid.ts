import { createClient } from '@/lib/supabase/server'

export async function getIsPaid(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_paid')
    .eq('user_id', userId)
    .single()
  if (error) console.error(`Missing user_profile for user ${userId}`)
  return data?.is_paid ?? false
}
