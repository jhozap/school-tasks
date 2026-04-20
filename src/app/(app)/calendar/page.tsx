import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { AppShell } from '@/components/layout/AppShell'
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'
import { CalendarFeed } from '@/components/calendar/CalendarFeed'
import { Suspense } from 'react'

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 rounded-xl bg-muted animate-pulse" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default async function CalendarPage() {
  const user = await getUser()
  const supabase = await createClient()
  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      <Suspense fallback={<AppShellSkeleton showTaskSkeleton={false} />}>
        <AppShell user={user!} workspaceId={workspaceId} mobileTitle="Calendario">
          <Suspense fallback={<CalendarSkeleton />}>
            <CalendarFeed workspaceId={workspaceId ?? ''} />
          </Suspense>
        </AppShell>
      </Suspense>
    </div>
  )
}
