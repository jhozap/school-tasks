import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { TaskFeed } from '@/components/tasks/TaskFeed'
import { TaskFeedSkeleton } from '@/components/tasks/TaskFeedSkeleton'
import { AutoRefresh } from '@/components/AutoRefresh'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace'
import type { Workspace, Reminder } from '@/types'

export default async function HomePage() {
  const [user, supabase] = await Promise.all([getUser(), createClient()])

  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  // Shell data: workspaces + reminders + pending count — fast, no joins
  const [wsData, remindersRes, countRes] = await Promise.all([
    supabase.from('workspace_users').select('workspaces(*)').eq('user_id', user!.id),
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
  const isOwner = activeWorkspace?.created_by === user!.id

  return (
    <>
      <AutoRefresh />

      <div className="lg:flex lg:h-screen lg:overflow-hidden">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={workspaceId ?? ''}
          userId={user!.id}
          isOwner={isOwner}
        />

        <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto">
          <TopBar
            userEmail={user!.email ?? ''}
            userName={user!.user_metadata?.full_name ?? user!.user_metadata?.name ?? ''}
            avatarUrl={user!.user_metadata?.avatar_url ?? user!.user_metadata?.picture ?? ''}
            pendingCount={pendingCount}
            reminders={reminders}
          />

          <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-28 lg:pb-10">
            <header className="lg:hidden flex items-center justify-between mb-10">
              <div className="space-y-1">
                {workspaces.length > 0 ? (
                  <WorkspaceSwitcher
                    workspaces={workspaces}
                    activeWorkspaceId={workspaceId ?? ''}
                    isOwner={isOwner}
                  />
                ) : (
                  <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Tareas
                  </h1>
                )}
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell reminders={reminders} />
                <ThemeToggle />
              </div>
            </header>

            {/* Tasks stream in independently — skeleton shown while loading */}
            <Suspense fallback={<TaskFeedSkeleton />}>
              <TaskFeed
                workspaceId={workspaceId ?? ''}
                userId={user!.id}
              />
            </Suspense>
          </main>
        </div>
      </div>

      <Suspense>
        <BottomNav
          userEmail={user!.email ?? ''}
          userId={user!.id}
          workspaces={workspaces}
          activeWorkspaceId={workspaceId ?? ''}
          remindersCount={reminders.length}
        />
      </Suspense>
    </>
  )
}
