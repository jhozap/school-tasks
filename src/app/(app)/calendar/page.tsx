import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Suspense } from 'react'
import type { Task, Reminder, Workspace } from '@/types'

export default async function CalendarPage() {
  const [user, supabase] = await Promise.all([getUser(), createClient()])

  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  const [wsData, tasksRes, remindersRes] = await Promise.all([
    supabase.from('workspace_users').select('workspaces(*)').eq('user_id', user!.id),
    workspaceId
      ? supabase.from('tasks').select('*').eq('workspace_id', workspaceId)
      : Promise.resolve({ data: [] }),
    workspaceId
      ? supabase.from('reminders').select('*').eq('workspace_id', workspaceId)
      : Promise.resolve({ data: [] }),
  ])

  const workspaces: Workspace[] = ((wsData.data ?? []) as { workspaces: unknown }[])
    .map(row => row.workspaces as Workspace)
    .filter(Boolean)

  if (workspaces.length === 0) redirect('/onboarding')

  const tasks = (tasksRes.data as Task[]) ?? []
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
          filter="calendar"
        />

        <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto">
          <TopBar
            userEmail={user!.email ?? ''}
            userName={user!.user_metadata?.full_name ?? user!.user_metadata?.name ?? ''}
            avatarUrl={user!.user_metadata?.avatar_url ?? user!.user_metadata?.picture ?? ''}
            filter="calendar"
            pendingCount={tasks.filter(t => t.status === 'pending').length}
            reminders={reminders}
          />

          <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-28 lg:pb-10">
            <header className="lg:hidden mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                Calendario
              </h1>
            </header>

            <CalendarView tasks={tasks} reminders={reminders} />
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
