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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="absolute inset-0 bg-black/20"
        style={{ backdropFilter: 'blur(4px)' }}
      />
      <div
        className="relative w-full max-w-md bg-card rounded-3xl p-6 shadow-xl"
        style={{ boxShadow: '0 24px 48px oklch(0.2 0.01 240 / 8%)' }}
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
