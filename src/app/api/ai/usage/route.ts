export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('ai_usage')
    .select('image_count, audio_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  return Response.json({
    image_count: data?.image_count ?? 0,
    audio_count: data?.audio_count ?? 0,
  })
}