'use client'

import { useState, useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { toggleTask, deleteTask } from '@/app/(app)/actions'
import type { TaskWithAttachments } from '@/types'
import { getDiffDays, formatDateParts, getTaskAccentColor } from '@/lib/dates'

interface Props {
  task: TaskWithAttachments
  workspaceId: string
  userId: string
}

const ORANGE = 'oklch(0.72 0.19 47)'

function AlertIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
}
function ClockIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}
function CheckIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

function StatusChip({ task }: { task: TaskWithAttachments }) {
  if (task.status === 'completed') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--chart-3) l c h / 0.15)', color: 'var(--chart-3)', fontFamily: 'var(--font-inter)' }}>
      <CheckIcon /> Completado
    </span>
  )
  if (!task.due_date) return null
  const diff = getDiffDays(task.due_date)
  if (diff < 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--destructive) l c h / 0.15)', color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
      <AlertIcon /> Urgente
    </span>
  )
  if (diff === 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--destructive) l c h / 0.15)', color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
      <AlertIcon /> Hoy
    </span>
  )
  if (diff === 1) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: `oklch(from ${ORANGE} l c h / 0.15)`, color: ORANGE, fontFamily: 'var(--font-inter)' }}>
      <ClockIcon /> Mañana
    </span>
  )
  if (diff <= 7) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--chart-4) l c h / 0.15)', color: 'var(--chart-4)', fontFamily: 'var(--font-inter)' }}>
      <ClockIcon /> Esta semana
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: 'oklch(from var(--chart-2) l c h / 0.15)', color: 'var(--chart-2)', fontFamily: 'var(--font-inter)' }}>
      <ClockIcon /> Próxima
    </span>
  )
}

function AttachmentBadges({ attachments }: { attachments: TaskWithAttachments['attachments'] }) {
  if (!attachments?.length) return null
  const images = attachments.filter(a => a.file_type.startsWith('image/'))
  const links = attachments.filter(a => a.file_type === 'link')
  const files = attachments.filter(a => !a.file_type.startsWith('image/') && a.file_type !== 'link')

  return (
    <div className="flex items-center gap-1.5">
      {images.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
          {images.length}
        </span>
      )}
      {links.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {links.length}
        </span>
      )}
      {files.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
          </svg>
          {files.length}
        </span>
      )}
    </div>
  )
}

export function TaskCard({ task, workspaceId, userId }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [, startTransition] = useTransition()
  const isOwner = task.created_by === userId

  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    task.status,
    (_: string, next: string) => next,
  )

  const optimisticTask = { ...task, status: optimisticStatus } as TaskWithAttachments

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    const next = task.status === 'pending' ? 'completed' : 'pending'
    startTransition(async () => {
      setOptimisticStatus(next)
      await toggleTask(task.id, task.status)
    })
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteTask(task.id)
    setConfirmDelete(false)
  }

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    setMenuOpen(v => !v)
  }

  const accentColor = getTaskAccentColor(optimisticTask.status, optimisticTask.due_date)

  const dateParts = task.due_date ? formatDateParts(task.due_date) : null

  return (
    <>
      <Link
        href={`/tasks/${task.id}`}
        className="bg-card rounded-2xl flex overflow-hidden cursor-pointer group transition-shadow hover:shadow-md"
        style={{ boxShadow: '0 2px 16px oklch(0.05 0 0 / 8%)' }}
      >
        {/* Accent bar */}
        <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: accentColor }} />

        {/* Main content */}
        <div className="flex-1 px-4 pt-2.5 pb-3.5 min-w-0 space-y-2">
          {/* Top row: badge + menu */}
          <div className="flex items-center justify-between gap-2">
            <StatusChip task={optimisticTask} />

            {isOwner && (
              <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={openMenu}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 hover:bg-muted"
                  style={{ color: 'var(--muted-foreground)' }}
                  aria-label="Opciones"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setMenuOpen(false) }} />
                    <div
                      className="absolute right-0 top-full mt-1 w-36 rounded-xl z-50 overflow-hidden shadow-lg"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Link
                        href={`/tasks/${task.id}?edit=true`}
                        onClick={e => { e.stopPropagation(); setMenuOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-muted text-left"
                        style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </Link>
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(true) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-muted text-left"
                        style={{ fontFamily: 'var(--font-inter)', color: 'var(--destructive)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Middle row: checkbox + title */}
          <div className="flex items-start gap-3">
            <button
              onClick={handleToggle}
              className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              style={{
                borderColor: optimisticStatus === 'completed' ? 'var(--chart-3)' : 'var(--border)',
                background: optimisticStatus === 'completed' ? 'var(--chart-3)' : 'transparent',
              }}
              aria-label="Cambiar estado"
            >
              {optimisticStatus === 'completed' && (
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
                  textDecoration: optimisticStatus === 'completed' ? 'line-through' : 'none',
                  color: optimisticStatus === 'completed' ? 'var(--muted-foreground)' : 'inherit',
                }}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1" style={{ fontFamily: 'var(--font-inter)' }}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Bottom row: attachments */}
          {task.attachments?.length > 0 && (
            <div className="pl-8">
              <AttachmentBadges attachments={task.attachments} />
            </div>
          )}
        </div>

        {/* Date block — right column */}
        {dateParts && (
          <div
            className="flex-shrink-0 w-16 flex flex-col items-center justify-center gap-0.5 rounded-r-2xl"
            style={{
              background: `oklch(from ${accentColor} l c h / 0.10)`,
              borderLeft: '1px solid oklch(from var(--border) l c h / 0.6)',
            }}
          >
            <span
              className="text-3xl font-extrabold leading-none"
              style={{ fontFamily: 'var(--font-manrope)', color: accentColor }}
            >
              {dateParts.day}
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-wide leading-none"
              style={{ fontFamily: 'var(--font-inter)', color: accentColor }}
            >
              {dateParts.month}
            </span>
            <span
              className="text-[10px] uppercase tracking-wide leading-none mt-0.5"
              style={{ fontFamily: 'var(--font-inter)', color: `oklch(from ${accentColor} l c h / 0.65)` }}
            >
              {dateParts.weekday}
            </span>
          </div>
        )}
      </Link>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setConfirmDelete(false)}>
          <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(6px)' }} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>¿Eliminar tarea?</h3>
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
                style={{ background: 'var(--destructive)', color: 'white', fontFamily: 'var(--font-inter)' }}
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
