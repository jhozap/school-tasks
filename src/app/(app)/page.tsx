import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { TaskList } from '@/components/tasks/TaskList'
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { RealtimeTaskSync } from '@/components/tasks/RealtimeTaskSync'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace'
import type { TaskWithAttachments, Workspace, Reminder } from '@/types'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { filter = 'all' } = await searchParams
  const [user, supabase] = await Promise.all([getUser(), createClient()])

  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  // Fetch workspaces + content in parallel once we have the workspace id
  const [wsData, tasksRes, remindersRes] = await Promise.all([
    supabase
      .from('workspace_users')
      .select('workspaces(*)')
      .eq('user_id', user!.id),
    workspaceId
      ? supabase
          .from('tasks')
          .select('*, attachments(*)')
          .eq('workspace_id', workspaceId)
          .order('due_date', { ascending: true, nullsFirst: false })
      : Promise.resolve({ data: [] }),
    workspaceId
      ? supabase
          .from('reminders')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('remind_at', { ascending: true })
      : Promise.resolve({ data: [] }),
  ])

  const workspaces: Workspace[] = ((wsData.data ?? []) as { workspaces: unknown }[])
    .map(row => row.workspaces as Workspace)
    .filter(Boolean)

  if (workspaces.length === 0) redirect('/onboarding')

  const tasks = (tasksRes.data as TaskWithAttachments[]) ?? []
  const reminders = (remindersRes.data as Reminder[]) ?? []

  const activeWorkspace = workspaces.find(w => w.id === workspaceId)
  const isOwner = activeWorkspace?.created_by === user!.id

  return (
    <>
      <div className="lg:flex lg:h-screen lg:overflow-hidden">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={workspaceId ?? ''}
          isOwner={isOwner}
          filter={filter}
        />

        <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto">
          <TopBar
            userEmail={user!.email ?? ''}
            userName={user!.user_metadata?.full_name ?? user!.user_metadata?.name ?? ''}
            avatarUrl={user!.user_metadata?.avatar_url ?? user!.user_metadata?.picture ?? ''}
            filter={filter}
            pendingCount={tasks.filter(t => t.status === 'pending').length}
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
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                  {tasks.filter(t => t.status === 'pending').length} pendientes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell reminders={reminders} />
                <ThemeToggle />
              </div>
            </header>

            <RealtimeTaskSync workspaceId={workspaceId ?? ''} />
            <TaskList tasks={tasks} workspaceId={workspaceId ?? ''} filter={filter} userId={user!.id} />
          </main>
        </div>
      </div>

      <Suspense>
        <BottomNav
          userEmail={user!.email ?? ''}
          workspaces={workspaces}
          activeWorkspaceId={workspaceId ?? ''}
          remindersCount={reminders.length}
        />
      </Suspense>
    </>
  )
}
