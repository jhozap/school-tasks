'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getWorkspaceId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('workspace_users')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()
  return data?.workspace_id ?? null
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  let workspaceId = await getWorkspaceId(supabase, user.id)

  if (!workspaceId) {
    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name: 'Mi familia', created_by: user.id })
      .select('id')
      .single()
    if (wsError || !ws) return { error: wsError?.message ?? 'Error creando workspace' }
    workspaceId = ws.id
    const { error: wuError } = await supabase
      .from('workspace_users')
      .insert({ workspace_id: workspaceId, user_id: user.id })
    if (wuError) return { error: wuError.message }
  }

  const { error } = await supabase.from('tasks').insert({
    workspace_id: workspaceId,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/')
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('tasks').update({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/')
}

export async function toggleTask(id: string, status: 'pending' | 'completed') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ status: status === 'pending' ? 'completed' : 'pending' })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
}
