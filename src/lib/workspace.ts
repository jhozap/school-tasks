import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const COOKIE_NAME = 'active_workspace_id'

export async function getActiveWorkspaceId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const cookieStore = await cookies()
  const cookieVal = cookieStore.get(COOKIE_NAME)?.value

  const { data: memberships } = await supabase
    .from('workspace_users')
    .select('workspace_id')
    .eq('user_id', userId)

  if (!memberships || memberships.length === 0) return null

  const ids = memberships.map(m => m.workspace_id)

  if (cookieVal && ids.includes(cookieVal)) return cookieVal

  return ids[0]
}

export async function setActiveWorkspaceCookie(workspaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, workspaceId, { httpOnly: true, path: '/', sameSite: 'lax' })
}

export async function clearActiveWorkspaceCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
