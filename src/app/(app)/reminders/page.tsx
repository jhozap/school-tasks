import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { RemindersView } from '@/components/reminders/RemindersView'
import { Suspense } from 'react'
import type { Reminder, Workspace } from '@/types'

export default async function RemindersPage() {
  const [user, supabase] = await Promise.all([getUser(), createClient()])

  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  const [wsData, remindersRes] = await Promise.all([
    supabase.from('workspace_users').select('workspaces(*)').eq('user_id', user!.id),
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
          filter="reminders"
        />

        <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto">
          <TopBar
            userEmail={user!.email ?? ''}
            userName={user!.user_metadata?.full_name ?? user!.user_metadata?.name ?? ''}
            avatarUrl={user!.user_metadata?.avatar_url ?? user!.user_metadata?.picture ?? ''}
            filter="reminders"
            pendingCount={0}
            reminders={reminders}
          />

          <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-28 lg:pb-10">
            <header className="lg:hidden mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
                Recordatorios
              </h1>
            </header>

            <RemindersView reminders={reminders} />
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
