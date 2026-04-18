'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie } from '@/lib/workspace'

export async function acceptInvitation(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: inv, error: invError } = await supabase
    .from('workspace_invitations')
    .select('id, workspace_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (invError || !inv) return { error: 'Invitación no encontrada' }
  if (inv.used_at) return { error: 'Esta invitación ya fue usada' }
  if (new Date(inv.expires_at) < new Date()) return { error: 'Esta invitación expiró' }

  const { error: wuError } = await supabase
    .from('workspace_users')
    .insert({ workspace_id: inv.workspace_id, user_id: user.id })

  if (wuError && !wuError.message.includes('duplicate')) {
    return { error: wuError.message }
  }

  await supabase
    .from('workspace_invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', inv.id)

  await setActiveWorkspaceCookie(inv.workspace_id)
  redirect('/')
}
