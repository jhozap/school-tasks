'use client'

import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import type { TaskWithAttachments } from '@/types'

interface Props {
  tasks: TaskWithAttachments[]
  workspaceId: string
  filter?: string
  userId: string
}

function getDiff(dueDateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function groupTasks(tasks: TaskWithAttachments[]) {
  const overdue: TaskWithAttachments[] = []
  const today: TaskWithAttachments[] = []
  const tomorrow: TaskWithAttachments[] = []
  const thisWeek: TaskWithAttachments[] = []
  const upcoming: TaskWithAttachments[] = []
  const noDue: TaskWithAttachments[] = []
  const completed: TaskWithAttachments[] = []

  for (const task of tasks) {
    if (task.status === 'completed') { completed.push(task); continue }
    if (!task.due_date) { noDue.push(task); continue }
    const diff = getDiff(task.due_date)
    if (diff < 0)       overdue.push(task)
    else if (diff === 0) today.push(task)
    else if (diff === 1) tomorrow.push(task)
    else if (diff <= 7)  thisWeek.push(task)
    else                 upcoming.push(task)
  }

  return { overdue, today, tomorrow, thisWeek, upcoming, noDue, completed }
}

function Section({ title, tasks, accent, workspaceId, userId }: { title: string; tasks: TaskWithAttachments[]; accent: string; workspaceId: string; userId: string }) {
  if (tasks.length === 0) return null
  return (
    <div className="space-y-3">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-inter)', color: accent }}
      >
        {title}
      </p>
      {tasks.map(task => <TaskCard key={task.id} task={task} workspaceId={workspaceId} userId={userId} />)}
    </div>
  )
}

export function TaskList({ tasks, workspaceId, filter = 'all', userId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const { overdue, today, tomorrow, thisWeek, upcoming, noDue, completed } = groupTasks(tasks)

  const urgentTasks = [...overdue, ...today, ...tomorrow]
  const isUrgentFilter = filter === 'urgent'
  const isAll = filter === 'all'

  const filteredEmpty = isUrgentFilter
    ? urgentTasks.length === 0
    : tasks.filter(t => t.status === 'pending').length === 0 && completed.length === 0

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

        {(isAll || isUrgentFilter) && <Section title="Vencidas" tasks={overdue} accent="var(--destructive)" workspaceId={workspaceId} userId={userId} />}
        {(isAll || isUrgentFilter) && <Section title="Hoy" tasks={today} accent="var(--destructive)" workspaceId={workspaceId} userId={userId} />}
        {(isAll || isUrgentFilter) && <Section title="Mañana" tasks={tomorrow} accent="var(--chart-4)" workspaceId={workspaceId} userId={userId} />}
        {isAll && <Section title="Esta semana" tasks={thisWeek} accent="var(--chart-4)" workspaceId={workspaceId} userId={userId} />}
        {isAll && <Section title="Próximas" tasks={upcoming} accent="var(--chart-2)" workspaceId={workspaceId} userId={userId} />}
        {isAll && <Section title="Sin fecha" tasks={noDue} accent="var(--muted-foreground)" workspaceId={workspaceId} userId={userId} />}
        {isAll && <Section title="Completadas" tasks={completed} accent="var(--chart-3)" workspaceId={workspaceId} userId={userId} />}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="lg:hidden fixed bottom-20 right-5 w-14 h-14 rounded-full text-2xl font-light shadow-lg flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
          color: 'var(--primary-foreground)',
          backdropFilter: 'blur(12px)',
        }}
        aria-label="Nueva tarea"
      >
        +
      </button>

      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
    </>
  )
}
