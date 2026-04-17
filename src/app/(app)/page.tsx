import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/tasks/TaskList'
import type { Task } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: wsUser } = await supabase
    .from('workspace_users')
    .select('workspace_id')
    .eq('user_id', user!.id)
    .single()

  let tasks: Task[] = []
  if (wsUser?.workspace_id) {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', wsUser.workspace_id)
      .order('due_date', { ascending: true, nullsFirst: false })
    tasks = (data as Task[]) ?? []
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full pb-24">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            Tareas
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
            {tasks.filter(t => t.status === 'pending').length} pendientes
          </p>
        </div>
        <form action={logout}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Salir
          </Button>
        </form>
      </header>

      <TaskList tasks={tasks} />
    </main>
  )
}
