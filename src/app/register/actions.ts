'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setActiveWorkspaceCookie } from '@/lib/workspace'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string).trim()
  const workspaceName = (formData.get('workspace_name') as string | null)?.trim() || `${fullName || 'Mis'} tareas`
  const next = (formData.get('next') as string) || '/'
  const avatarFile = formData.get('avatar') as File | null

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Error al registrarse' }
  }

  const userId = authData.user.id

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const { data: uploadData } = await supabase.storage
      .from('avatars')
      .upload(`${userId}.${ext}`, avatarFile, { upsert: true, contentType: avatarFile.type })

    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
    }
  }

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
