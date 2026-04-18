'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'

export async function createReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id)
  if (!workspaceId) return { error: 'Sin workspace activo' }

  const { error } = await supabase.from('reminders').insert({
    workspace_id: workspaceId,
    created_by: user.id,
    title: formData.get('title') as string,
    notes: (formData.get('notes') as string) || null,
    remind_at: formData.get('remind_at') as string,
  })

  if (error) return { error: error.message }
  revalidatePath('/')
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
}
