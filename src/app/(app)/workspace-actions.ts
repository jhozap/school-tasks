'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie, clearActiveWorkspaceCookie } from '@/lib/workspace'
import { z } from 'zod'

const workspaceNameSchema = z.string().min(1).max(100)

export async function createWorkspace(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = workspaceNameSchema.safeParse(name.trim())
  const safeName = parsed.success ? parsed.data : 'Nuevo workspace'

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: safeName, created_by: user.id })
    .select('id')
    .single()

  if (wsError || !ws) return { error: wsError?.message ?? 'Error creando workspace' }

  const { error: wuError } = await supabase
    .from('workspace_users')
    .insert({ workspace_id: ws.id, user_id: user.id })

  if (wuError) return { error: wuError.message }

  await setActiveWorkspaceCookie(ws.id)
  revalidatePath('/')
  revalidatePath('/calendar')
  revalidatePath('/reminders')
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
  revalidatePath('/calendar')
  revalidatePath('/reminders')
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verify ownership (RLS also blocks non-owners)
  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('created_by', user.id)
    .single()
  if (!ws) return { error: 'Sin permisos para eliminar este workspace' }

  // Fetch all file attachments (not links) to delete from storage
  const { data: fileAttachments } = await supabase
    .from('attachments')
    .select('file_url, tasks!inner(workspace_id)')
    .eq('tasks.workspace_id', workspaceId)
    .neq('file_type', 'link')

  if (fileAttachments?.length) {
    const paths = (fileAttachments as { file_url: string }[]).map(a => a.file_url)
    await supabase.storage.from('attachments').remove(paths)
  }

  // Delete workspace — DB cascade handles workspace_users, tasks, attachments, reminders, invitations
  const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId)
  if (error) return { error: error.message }

  // Clear cookie if this was the active workspace
  const cookieStore = await cookies()
  if (cookieStore.get('active_workspace_id')?.value === workspaceId) {
    await clearActiveWorkspaceCookie()
  }

  revalidatePath('/')
  revalidatePath('/calendar')
  revalidatePath('/reminders')
  return {}
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
