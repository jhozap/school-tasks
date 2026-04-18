'use client'

import { useEffect } from 'react'
import { TaskForm } from './TaskForm'
import type { Task } from '@/types'

interface Props {
  task?: Task
  onClose: () => void
}

export function TaskModal({ task, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50"
        style={{ backdropFilter: 'blur(8px)' }}
      />
      <div
        className="relative w-full sm:max-w-md bg-card sm:rounded-3xl rounded-t-3xl p-6 shadow-xl"
        style={{ boxShadow: '0 24px 64px oklch(0.05 0 0 / 32%)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            {task ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 text-sm"
          >
            ✕
          </button>
        </div>
        <TaskForm task={task} onClose={onClose} />
      </div>
    </div>
  )
}
