import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { RemindersFeed } from '@/components/reminders/RemindersFeed'
import { Suspense } from 'react'

function RemindersSkeleton() {
  return (
    <div className="space-y-3 min-h-[264px]">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}

export default async function RemindersPage() {
  const user = await getUser()
  const supabase = await createClient()
  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  return (
    <Suspense fallback={<RemindersSkeleton />}>
      <RemindersFeed workspaceId={workspaceId ?? ''} />
    </Suspense>
  )
}
