'use client'

import { useState } from 'react'
import { toggleTask, deleteTask } from '@/app/(app)/actions'
import { TaskModal } from './TaskModal'
import { AttachmentPanel } from './AttachmentPanel'
import type { TaskWithAttachments } from '@/types'

interface Props {
  task: TaskWithAttachments
  workspaceId: string
  userId: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getDiffDays(dueDateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getAccentColor(task: TaskWithAttachments) {
  if (task.status === 'completed') return 'var(--chart-3)'
  if (!task.due_date) return 'var(--muted-foreground)'
  const diff = getDiffDays(task.due_date)
  if (diff < 0)  return 'var(--destructive)'
  if (diff === 0) return 'var(--destructive)'
  if (diff === 1) return 'var(--chart-4)'
  if (diff <= 7)  return 'var(--chart-4)'
  return 'var(--chart-2)'
}

function CheckIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
function AlertIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
}
function ClockIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function StatusChip({ task }: { task: TaskWithAttachments }) {
  if (task.status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
        style={{ background: 'oklch(from var(--chart-3) l c h / 0.15)', color: 'var(--chart-3)', fontFamily: 'var(--font-inter)' }}>
        <CheckIcon /> Completado
      </span>
    )
  }
  if (!task.due_date) return null
  const diff = getDiffDays(task.due_date)

  if (diff < 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--destructive) l c h / 0.15)', color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
      <AlertIcon /> Vencida
    </span>
  )
  if (diff === 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--destructive) l c h / 0.15)', color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
      <AlertIcon /> Hoy
    </span>
  )
  if (diff === 1) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--chart-4) l c h / 0.15)', color: 'var(--chart-4)', fontFamily: 'var(--font-inter)' }}>
      <ClockIcon /> Mañana
    </span>
  )
  if (diff <= 7) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--chart-4) l c h / 0.15)', color: 'var(--chart-4)', fontFamily: 'var(--font-inter)' }}>
      <ClockIcon /> Esta semana
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--chart-2) l c h / 0.15)', color: 'var(--chart-2)', fontFamily: 'var(--font-inter)' }}>
      <ClockIcon /> Próxima
    </span>
  )
}

export function TaskCard({ task, workspaceId, userId }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwner = task.created_by === userId

  async function handleToggle() {
    await toggleTask(task.id, task.status)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteTask(task.id)
    setConfirmDelete(false)
  }

  return (
    <>
      <div
        className="bg-card rounded-2xl flex overflow-hidden"
        style={{ boxShadow: '0 2px 16px oklch(0.05 0 0 / 8%)' }}
      >
        <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: getAccentColor(task) }} />

        <div className="flex-1 px-4 py-4 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <StatusChip task={task} />

              <div className="flex items-start gap-2">
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
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2" style={{ fontFamily: 'var(--font-inter)' }}>
                      {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <p className="text-xs font-medium" style={{ fontFamily: 'var(--font-inter)', color: getAccentColor(task) }}>
                        {formatDate(task.due_date)}
                      </p>
                    </div>
                  )}
                </div>

                {isOwner && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditing(true)}
                      className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground text-xs transition-colors"
                      aria-label="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive text-xs transition-colors"
                      aria-label="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              <AttachmentPanel
                attachments={task.attachments ?? []}
                taskId={task.id}
                workspaceId={workspaceId}
              />
            </div>
          </div>
        </div>
      </div>

      {editing && <TaskModal task={task} onClose={() => setEditing(false)} />}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(6px)' }} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
                ¿Eliminar tarea?
              </h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{task.title}</span> será eliminada permanentemente.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'var(--destructive)',
                  color: 'white',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
