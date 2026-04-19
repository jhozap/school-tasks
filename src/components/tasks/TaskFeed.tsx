import { createClient } from '@/lib/supabase/server'
import { TaskList } from './TaskList'
import type { TaskWithAttachments } from '@/types'

interface Props {
  workspaceId: string
  userId: string
}

export async function TaskFeed({ workspaceId, userId }: Props) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('tasks')
    .select('*, attachments(id, file_type)')
    .eq('workspace_id', workspaceId)
    .order('due_date', { ascending: true, nullsFirst: false })

  const tasks = (data as TaskWithAttachments[]) ?? []

  return (
    <TaskList tasks={tasks} workspaceId={workspaceId} userId={userId} />
  )
}
