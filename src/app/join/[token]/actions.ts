'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie } from '@/lib/workspace'

export async function acceptInvitation(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: result, error } = await supabase
    .rpc('accept_invitation', { p_token: token, p_user_id: user.id })

  if (error) return { error: 'Error al procesar la invitación' }
  if (result?.error) return { error: result.error as string }

  await setActiveWorkspaceCookie(result.workspace_id as string)
  redirect('/')
}
