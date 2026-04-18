import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { TaskDetailView } from '@/components/tasks/TaskDetailView'
import type { TaskWithAttachments } from '@/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function TaskDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  const { data } = await supabase
    .from('tasks')
    .select('*, attachments(*)')
    .eq('id', id)
    .eq('workspace_id', workspaceId ?? '')
    .single()

  if (!data) notFound()

  return (
    <TaskDetailView
      task={data as TaskWithAttachments}
      userId={user!.id}
      workspaceId={workspaceId ?? ''}
      initialEdit={edit === 'true'}
    />
  )
}
