import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { Suspense } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Workspace, Reminder } from '@/types'

interface Props {
  user: User
  workspaceId: string | null
  children: React.ReactNode
  mobileTitle?: string
}

export async function AppShell({ user, workspaceId, children, mobileTitle }: Props) {
  const supabase = await createClient()

  const [wsData, remindersRes, countRes] = await Promise.all([
    supabase.from('workspace_users').select('workspaces(*)').eq('user_id', user.id),
    workspaceId
      ? supabase.from('reminders').select('*').eq('workspace_id', workspaceId).order('remind_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    workspaceId
      ? supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'pending')
      : Promise.resolve({ count: 0 }),
  ])

  const workspaces: Workspace[] = ((wsData.data ?? []) as { workspaces: unknown }[])
    .map(row => row.workspaces as Workspace)
    .filter(Boolean)

  if (workspaces.length === 0) redirect('/onboarding')

  const reminders = (remindersRes.data as Reminder[]) ?? []
  const pendingCount = (countRes as { count: number | null }).count ?? 0
  const activeWorkspace = workspaces.find(w => w.id === workspaceId)
  const isOwner = activeWorkspace?.created_by === user.id

  return (
    <>
      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={workspaceId ?? ''}
        userId={user.id}
        isOwner={isOwner}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto">
        <TopBar
          userEmail={user.email ?? ''}
          userName={user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''}
          avatarUrl={user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? ''}
          pendingCount={pendingCount}
          reminders={reminders}
        />

        <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-28 lg:pb-10">
          {mobileTitle ? (
            <header className="lg:hidden mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                {mobileTitle}
              </h1>
            </header>
          ) : (
            <header className="lg:hidden flex items-center justify-between mb-10">
              <div className="space-y-1">
                <WorkspaceSwitcher
                  workspaces={workspaces}
                  activeWorkspaceId={workspaceId ?? ''}
                  isOwner={isOwner}
                />
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell reminders={reminders} />
                <ThemeToggle />
              </div>
            </header>
          )}

          {children}
        </main>
      </div>

      <Suspense>
        <BottomNav
          userEmail={user.email ?? ''}
          userId={user.id}
          workspaces={workspaces}
          activeWorkspaceId={workspaceId ?? ''}
          remindersCount={reminders.length}
        />
      </Suspense>
    </>
  )
}
