'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie } from '@/lib/workspace'

export async function createWorkspace(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: name.trim() || 'Nuevo workspace', created_by: user.id })
    .select('id')
    .single()

  if (wsError || !ws) return { error: wsError?.message ?? 'Error creando workspace' }

  const { error: wuError } = await supabase
    .from('workspace_users')
    .insert({ workspace_id: ws.id, user_id: user.id })

  if (wuError) return { error: wuError.message }

  await setActiveWorkspaceCookie(ws.id)
  revalidatePath('/')
}

export async function switchWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data } = await supabase
    .from('workspace_users')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .single()

  if (!data) return { error: 'Sin acceso a este workspace' }

  await setActiveWorkspaceCookie(workspaceId)
  revalidatePath('/')
}

export async function createInvitation(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('workspace_invitations')
    .insert({ workspace_id: workspaceId, created_by: user.id })
    .select('token')
    .single()

  if (error || !data) return { error: error?.message ?? 'Error generando invitación' }

  return { token: data.token as string }
}
