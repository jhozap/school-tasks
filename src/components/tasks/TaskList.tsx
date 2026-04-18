'use client'

import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import type { TaskWithAttachments } from '@/types'

interface Props {
  tasks: TaskWithAttachments[]
  workspaceId: string
  filter?: string
}

function groupTasks(tasks: TaskWithAttachments[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const urgent: TaskWithAttachments[] = []
  const upcoming: TaskWithAttachments[] = []
  const noDue: TaskWithAttachments[] = []
  const completed: TaskWithAttachments[] = []

  for (const task of tasks) {
    if (task.status === 'completed') { completed.push(task); continue }
    if (!task.due_date) { noDue.push(task); continue }
    const due = new Date(task.due_date + 'T00:00:00')
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 1) urgent.push(task)
    else upcoming.push(task)
  }

  return { urgent, upcoming, noDue, completed }
}

function Section({ title, tasks, accent, workspaceId }: { title: string; tasks: TaskWithAttachments[]; accent: string; workspaceId: string }) {
  if (tasks.length === 0) return null
  return (
    <div className="space-y-3">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-inter)', color: accent }}
      >
        {title}
      </p>
      {tasks.map(task => <TaskCard key={task.id} task={task} workspaceId={workspaceId} />)}
    </div>
  )
}

export function TaskList({ tasks, workspaceId, filter = 'all' }: Props) {
  const [showModal, setShowModal] = useState(false)
  const { urgent, upcoming, noDue, completed } = groupTasks(tasks)
  const isEmpty = tasks.filter(t => t.status === 'pending').length === 0

  const showUrgent = filter === 'all' || filter === 'urgent'
  const showUpcoming = filter === 'all'
  const showNoDue = filter === 'all'
  const showCompleted = filter === 'all'

  const filteredEmpty = filter === 'urgent' ? urgent.length === 0 : isEmpty && completed.length === 0

  return (
    <>
      <div className="space-y-10">
        {filteredEmpty && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl">
              {filter === 'urgent' ? '✅' : '📚'}
            </div>
            <p className="text-sm font-medium text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              {filter === 'urgent' ? 'Sin tareas urgentes' : 'No hay tareas pendientes'}
            </p>
            {filter === 'all' && (
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                Toca el botón + para agregar una
              </p>
            )}
          </div>
        )}

        {showUrgent && <Section title="Urgente" tasks={urgent} accent="var(--destructive)" workspaceId={workspaceId} />}
        {showUpcoming && <Section title="Próximas" tasks={upcoming} accent="var(--chart-4)" workspaceId={workspaceId} />}
        {showNoDue && <Section title="Sin fecha" tasks={noDue} accent="var(--muted-foreground)" workspaceId={workspaceId} />}
        {showCompleted && <Section title="Completadas" tasks={completed} accent="var(--chart-3)" workspaceId={workspaceId} />}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-5 lg:bottom-6 lg:right-8 w-14 h-14 rounded-full text-2xl font-light shadow-lg flex items-center justify-center"
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
