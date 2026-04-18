'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie } from '@/lib/workspace'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const workspaceName = (formData.get('workspace_name') as string).trim() || 'Mis tareas'
  const next = (formData.get('next') as string) || '/'

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Error al registrarse' }
  }

  const userId = authData.user.id

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: workspaceName, created_by: userId })
    .select('id')
    .single()

  if (wsError || !ws) return { error: wsError?.message ?? 'Error creando workspace' }

  const { error: wuError } = await supabase
    .from('workspace_users')
    .insert({ workspace_id: ws.id, user_id: userId })

  if (wuError) return { error: wuError.message }

  await setActiveWorkspaceCookie(ws.id)
  redirect(next)
}
