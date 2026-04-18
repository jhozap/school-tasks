'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteReminder } from '@/app/(app)/reminder-actions'
import { ReminderModal } from '@/components/tasks/ReminderModal'
import type { Reminder } from '@/types'

interface Props {
  reminders: Reminder[]
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date()
}

function formatRemindAt(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffMs < 0) {
    const absMins = Math.round(-diffMs / 60000)
    if (absMins < 60) return `Hace ${absMins} min`
    const absHours = Math.round(-diffMs / 3600000)
    if (absHours < 24) return `Hace ${absHours} h`
    return `Hace ${Math.round(-diffMs / 86400000)} días`
  }
  if (diffMins < 60) return `En ${diffMins} min`
  if (diffHours < 24) return `En ${diffHours} h`
  if (diffDays === 1) return 'Mañana'
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function RemindersView({ reminders }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const upcoming = reminders.filter(r => !isOverdue(r.remind_at))
  const past = reminders.filter(r => isOverdue(r.remind_at))

  async function handleDelete(id: string) {
    setDeleting(id)
    await deleteReminder(id)
    setDeleting(null)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-8">
        {/* Create button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo recordatorio
        </button>

        {reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
              Sin recordatorios activos
            </p>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)', color: 'var(--primary)' }}>
              Próximos ({upcoming.length})
            </p>
            <div className="space-y-2">
              {upcoming.map(r => (
                <ReminderCard key={r.id} reminder={r} onDelete={handleDelete} deleting={deleting === r.id} />
              ))}
            </div>
          </section>
        )}

        {/* Past / overdue */}
        {past.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}>
              Vencidos ({past.length})
            </p>
            <div className="space-y-2">
              {past.map(r => (
                <ReminderCard key={r.id} reminder={r} onDelete={handleDelete} deleting={deleting === r.id} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showModal && (
        <ReminderModal onClose={() => { setShowModal(false); router.refresh() }} />
      )}
    </>
  )
}

function ReminderCard({ reminder: r, onDelete, deleting }: { reminder: Reminder; onDelete: (id: string) => void; deleting: boolean }) {
  const overdue = isOverdue(r.remind_at)

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-2xl group"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 16px oklch(0.05 0 0 / 6%)' }}
    >
      {/* Dot indicator */}
      <div
        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: overdue ? 'var(--muted-foreground)' : 'var(--primary)' }}
      />

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{
            fontFamily: 'var(--font-inter)',
            color: overdue ? 'var(--muted-foreground)' : 'var(--foreground)',
            textDecoration: overdue ? 'line-through' : 'none',
          }}
        >
          {r.title}
        </p>
        {r.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2" style={{ fontFamily: 'var(--font-inter)' }}>
            {r.notes}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span
            className="text-xs font-medium"
            style={{ fontFamily: 'var(--font-inter)', color: overdue ? 'var(--muted-foreground)' : 'var(--primary)' }}
          >
            {formatRemindAt(r.remind_at)}
          </span>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
            · {formatFullDate(r.remind_at)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(r.id)}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-40"
        style={{ color: 'var(--destructive)' }}
        aria-label="Eliminar recordatorio"
      >
        {deleting ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
        )}
      </button>
    </div>
  )
}
