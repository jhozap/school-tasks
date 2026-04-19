'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: (formData.get('title') as string)?.trim(),
    description: (formData.get('description') as string) || undefined,
    due_date: (formData.get('due_date') as string) || undefined,
  })
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Sin workspace activo' }

  const parsed = parseTaskForm(formData)
  if (!parsed.success) return { error: 'Datos inválidos' }
  const { title, description, due_date } = parsed.data

  const { error } = await supabase.from('tasks').insert({
    workspace_id: workspaceId,
    created_by: user.id,
    title,
    description: description ?? null,
    due_date: due_date ?? null,
  })

  if (error) return { error: 'Error al crear la tarea' }
  revalidatePath('/')
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const parsed = parseTaskForm(formData)
  if (!parsed.success) return { error: 'Datos inválidos' }
  const { title, description, due_date } = parsed.data

  const { error } = await supabase.from('tasks').update({
    title,
    description: description ?? null,
    due_date: due_date ?? null,
  }).eq('id', id).eq('created_by', user.id)

  if (error) return { error: 'Error al actualizar la tarea' }
  revalidatePath('/')
}

export async function toggleTask(id: string, status: 'pending' | 'completed') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('tasks')
    .update({ status: status === 'pending' ? 'completed' : 'pending' })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: 'Error al actualizar la tarea' }
  revalidatePath('/')
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('tasks').delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: 'Error al eliminar la tarea' }
  revalidatePath('/')
}
