'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { broadcastTaskChange } from '@/lib/broadcast'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Sin workspace activo' }

  const { error } = await supabase.from('tasks').insert({
    workspace_id: workspaceId,
    created_by: user.id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/')
  await broadcastTaskChange(workspaceId)
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)

  const { error } = await supabase.from('tasks').update({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/')
  if (workspaceId) await broadcastTaskChange(workspaceId)
}

export async function toggleTask(id: string, status: 'pending' | 'completed') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)

  const { error } = await supabase
    .from('tasks')
    .update({ status: status === 'pending' ? 'completed' : 'pending' })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/')
  if (workspaceId) await broadcastTaskChange(workspaceId)
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  if (workspaceId) await broadcastTaskChange(workspaceId)
}
