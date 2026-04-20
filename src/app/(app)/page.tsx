import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { AppShell } from '@/components/layout/AppShell'
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'
import { TaskFeed } from '@/components/tasks/TaskFeed'
import { TaskFeedSkeleton } from '@/components/tasks/TaskFeedSkeleton'
import { AutoRefresh } from '@/components/AutoRefresh'
import { Suspense } from 'react'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const user = await getUser()
  const supabase = await createClient()
  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)
  const { filter = 'all' } = await searchParams
  const activeNav = filter === 'urgent' ? 'urgent' : 'all'

  return (
    <>
      <AutoRefresh />
      <div className="lg:flex lg:h-screen lg:overflow-hidden">
        <Suspense fallback={<AppShellSkeleton />}>
          <AppShell user={user!} workspaceId={workspaceId} activeNav={activeNav}>
            <div className="min-h-[560px]">
              <Suspense fallback={<TaskFeedSkeleton />}>
                <TaskFeed workspaceId={workspaceId ?? ''} userId={user!.id} />
              </Suspense>
            </div>
          </AppShell>
        </Suspense>
      </div>
    </>
  )
}
