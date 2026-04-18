import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const COOKIE_NAME = 'active_workspace_id'

export async function getActiveWorkspaceId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const cookieStore = await cookies()
  const cookieVal = cookieStore.get(COOKIE_NAME)?.value

  // Trust the cookie — Supabase RLS rejects any invalid workspace_id anyway.
  // Only hit the DB when there is no cookie yet.
  if (cookieVal) return cookieVal

  const { data: memberships } = await supabase
    .from('workspace_users')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)

  if (!memberships?.length) return null

  return memberships[0].workspace_id
}

export async function setActiveWorkspaceCookie(workspaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, workspaceId, { httpOnly: true, path: '/', sameSite: 'lax' })
}

export async function clearActiveWorkspaceCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
