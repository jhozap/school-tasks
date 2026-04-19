'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addAttachmentRecord(
  taskId: string,
  storagePath: string,
  fileType: string,
  fileName: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('attachments')
    .insert({ task_id: taskId, file_url: storagePath, file_type: fileType, file_name: fileName })
    .select('id')
    .single()

  if (error) return { error: 'Error al guardar el archivo' }
  revalidatePath('/')
  return { id: data.id as string }
}

export async function addLinkAttachment(taskId: string, url: string, label: string) {
  try { new URL(url) } catch { return { error: 'URL inválida' } }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data, error } = await supabase
    .from('attachments')
    .insert({ task_id: taskId, file_url: url, file_type: 'link', file_name: label || url })
    .select('id')
    .single()

  if (error) return { error: 'Error al guardar el enlace' }
  revalidatePath('/')
  return { id: data.id as string }
}

export async function deleteAttachment(attachmentId: string, storagePath: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (storagePath) {
    await supabase.storage.from('attachments').remove([storagePath])
  }

  const { error } = await supabase.from('attachments').delete().eq('id', attachmentId)
  if (error) return { error: 'Error al eliminar el archivo' }
  revalidatePath('/')
}
