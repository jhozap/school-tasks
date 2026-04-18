import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/tasks/TaskList'
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { Suspense } from 'react'
import { getActiveWorkspaceId } from '@/lib/workspace'
import type { TaskWithAttachments, Workspace } from '@/types'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { filter = 'all' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const workspaceId = await getActiveWorkspaceId(supabase, user!.id)

  const { data: wsData } = await supabase
    .from('workspace_users')
    .select('workspaces(*)')
    .eq('user_id', user!.id)

  const workspaces: Workspace[] = (wsData ?? [])
    .map(row => row.workspaces as unknown as Workspace)
    .filter(Boolean)

  let tasks: TaskWithAttachments[] = []

  if (workspaceId) {
    const { data } = await supabase
      .from('tasks')
      .select('*, attachments(*)')
      .eq('workspace_id', workspaceId)
      .order('due_date', { ascending: true, nullsFirst: false })
    tasks = (data as TaskWithAttachments[]) ?? []
  }

  const activeWorkspace = workspaces.find(w => w.id === workspaceId)
  const isOwner = activeWorkspace?.created_by === user!.id

  return (
    <>
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-28 lg:pb-10">
        <header className="flex items-center justify-between mb-10">
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
            <ThemeToggle />
            <form action={logout} className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Salir
              </Button>
            </form>
          </div>
        </header>

        <TaskList tasks={tasks} workspaceId={workspaceId ?? ''} filter={filter} />
      </main>

      <Suspense>
        <BottomNav
          userEmail={user!.email ?? ''}
          workspaces={workspaces}
          activeWorkspaceId={workspaceId ?? ''}
        />
      </Suspense>
    </>
  )
}
