'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { z } from 'zod'

const reminderSchema = z.object({
  title: z.string().min(1).max(255),
  notes: z.string().max(5000).optional(),
  remind_at: z.string().min(1),
})

export async function createReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Sin workspace activo' }

  const parsed = reminderSchema.safeParse({
    title: (formData.get('title') as string)?.trim(),
    notes: (formData.get('notes') as string) || undefined,
    remind_at: formData.get('remind_at') as string,
  })
  if (!parsed.success) return { error: 'Datos inválidos' }
  const { title, notes, remind_at } = parsed.data

  const { error } = await supabase.from('reminders').insert({
    workspace_id: workspaceId,
    created_by: user.id,
    title,
    notes: notes ?? null,
    remind_at,
  })

  if (error) return { error: 'Error al crear el recordatorio' }
  revalidatePath('/')
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('reminders').delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: 'Error al eliminar el recordatorio' }
  revalidatePath('/')
}
