import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { AppShell } from '@/components/layout/AppShell'
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'
import { PullToRefresh } from '@/components/PullToRefresh'
import type { ActiveNav } from '@/components/layout/Sidebar'

function computeActiveNav(pathname: string, search: string): ActiveNav {
  if (pathname === '/calendar') return 'calendar'
  if (pathname === '/reminders') return 'reminders'
  return new URLSearchParams(search).get('filter') === 'urgent' ? 'urgent' : 'all'
}

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const h = await headers()
  const pathname = h.get('x-pathname') ?? '/'
  const search = h.get('x-search') ?? ''
  const activeNav = computeActiveNav(pathname, search)

  const supabase = await createClient()
  const workspaceId = await getActiveWorkspaceId(supabase, user.id)

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      <Suspense fallback={<AppShellSkeleton />}>
        <AppShell user={user} workspaceId={workspaceId} activeNav={activeNav}>
          <PullToRefresh>{children}</PullToRefresh>
        </AppShell>
      </Suspense>
    </div>
  )
}
