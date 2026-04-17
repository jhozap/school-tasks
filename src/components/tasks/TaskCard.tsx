'use client'

import { useState } from 'react'
import { toggleTask, deleteTask } from '@/app/(app)/actions'
import { TaskModal } from './TaskModal'
import type { Task } from '@/types'

interface Props {
  task: Task
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getAccentColor(task: Task) {
  if (task.status === 'completed') return 'var(--chart-3)'
  if (!task.due_date) return 'var(--chart-2)'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date + 'T00:00:00')
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 1) return 'var(--destructive)'
  if (diff <= 4) return 'var(--chart-4)'
  return 'var(--chart-2)'
}

export function TaskCard({ task }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle() {
    await toggleTask(task.id, task.status)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta tarea?')) return
    setDeleting(true)
    await deleteTask(task.id)
  }

  return (
    <>
      <div
        className="bg-card rounded-2xl flex overflow-hidden"
        style={{ boxShadow: '0 2px 16px oklch(0.2 0.01 240 / 5%)' }}
      >
        <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: getAccentColor(task) }} />

        <div className="flex-1 px-5 py-4 min-w-0">
          <div className="flex items-start gap-3">
            <button
              onClick={handleToggle}
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              style={{
                borderColor: task.status === 'completed' ? 'var(--chart-3)' : 'var(--border)',
                background: task.status === 'completed' ? 'var(--chart-3)' : 'transparent',
              }}
              aria-label="Cambiar estado"
            >
              {task.status === 'completed' && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold leading-snug"
                style={{
                  fontFamily: 'var(--font-inter)',
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'var(--muted-foreground)' : 'inherit',
                }}
              >
                {task.title}
              </p>
              {task.description && (
                <p
                  className="text-xs text-muted-foreground mt-1 line-clamp-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {task.description}
                </p>
              )}
              {task.due_date && (
                <p
                  className="text-xs mt-2 font-medium"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: getAccentColor(task),
                  }}
                >
                  {formatDate(task.due_date)}
                </p>
              )}
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground text-xs transition-colors"
                aria-label="Editar"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive text-xs transition-colors"
                aria-label="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      {editing && <TaskModal task={task} onClose={() => setEditing(false)} />}
    </>
  )
}
