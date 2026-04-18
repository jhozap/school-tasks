'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie } from '@/lib/workspace'

export async function createFirstWorkspace(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = (formData.get('name') as string).trim() || 'Mi workspace'

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name, created_by: user.id })
    .select('id')
    .single()

  if (wsError || !ws) return { error: wsError?.message ?? 'Error creando workspace' }

  const { error: wuError } = await supabase
    .from('workspace_users')
    .insert({ workspace_id: ws.id, user_id: user.id })

  if (wuError) return { error: wuError.message }

  await setActiveWorkspaceCookie(ws.id)
  redirect('/')
}
