import { createClient } from '@/lib/supabase/server'
import { RemindersView } from './RemindersView'
import type { Reminder } from '@/types'

export async function RemindersFeed({ workspaceId }: { workspaceId: string }) {
  if (!workspaceId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('remind_at', { ascending: true })

  return <RemindersView reminders={(data as Reminder[]) ?? []} />
}
