'use client'

import { useSearchParams } from 'next/navigation'
import { TaskCard } from './TaskCard'
import type { TaskWithAttachments } from '@/types'

interface Props {
  tasks: TaskWithAttachments[]
  workspaceId: string
  userId: string
}

function getDiff(dueDateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function groupTasks(tasks: TaskWithAttachments[]) {
  const urgent: TaskWithAttachments[] = []
  const upcoming: TaskWithAttachments[] = []
  const completed: TaskWithAttachments[] = []

  for (const task of tasks) {
    if (task.status === 'completed') { completed.push(task); continue }
    if (!task.due_date) { upcoming.push(task); continue }

    const diff = getDiff(task.due_date)
    if (diff <= 1) urgent.push(task)
    else upcoming.push(task)
  }

  return { urgent, upcoming, completed }
}

function Section({
  title, tasks, accent, workspaceId, userId,
}: {
  title: string; tasks: TaskWithAttachments[]; accent: string; workspaceId: string; userId: string
}) {
  if (tasks.length === 0) return null
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)', color: accent }}>
        {title}
      </p>
      {tasks.map(task => <TaskCard key={task.id} task={task} workspaceId={workspaceId} userId={userId} />)}
    </div>
  )
}

export function TaskList({ tasks, workspaceId, userId }: Props) {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') ?? 'all'
  const { urgent, upcoming, completed } = groupTasks(tasks)

  const isUrgentFilter = filter === 'urgent'
  const isAll = filter === 'all'

  const filteredEmpty = isUrgentFilter
    ? urgent.length === 0
    : tasks.length === 0

  return (
    <>
      <div className="space-y-10">
        {filteredEmpty && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl">
              {isUrgentFilter ? '✅' : '📚'}
            </div>
            <p className="text-sm font-medium text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              {isUrgentFilter ? 'Sin tareas urgentes' : 'No hay tareas pendientes'}
            </p>
            {isAll && (
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Toca el botón + para agregar una
              </p>
            )}
          </div>
        )}

        {(isAll || isUrgentFilter) && <Section title="Urgentes" tasks={urgent} accent="var(--destructive)" workspaceId={workspaceId} userId={userId} />}
        {isAll && <Section title="Próximas" tasks={upcoming} accent="var(--chart-2)" workspaceId={workspaceId} userId={userId} />}
        {isAll && <Section title="Completadas" tasks={completed} accent="var(--chart-3)" workspaceId={workspaceId} userId={userId} />}
      </div>

    </>
  )
}
