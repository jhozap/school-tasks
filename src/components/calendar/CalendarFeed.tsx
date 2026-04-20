import { createClient } from '@/lib/supabase/server'
import { CalendarView } from './CalendarView'
import type { Task, Reminder } from '@/types'

export async function CalendarFeed({ workspaceId }: { workspaceId: string }) {
  if (!workspaceId) return null

  const supabase = await createClient()
  const [tasksRes, remindersRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('workspace_id', workspaceId),
    supabase.from('reminders').select('*').eq('workspace_id', workspaceId),
  ])

  return (
    <CalendarView
      tasks={(tasksRes.data as Task[]) ?? []}
      reminders={(remindersRes.data as Reminder[]) ?? []}
    />
  )
}
