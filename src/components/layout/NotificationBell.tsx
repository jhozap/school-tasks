'use client'

import { useState } from 'react'
import { deleteReminder } from '@/app/(app)/reminder-actions'
import type { Reminder } from '@/types'

interface Props {
  reminders: Reminder[]
}

function formatRemindAt(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffMs < 0) return 'Vencido'
  if (diffMins < 60) return `En ${diffMins} min`
  if (diffHours < 24) return `En ${diffHours} h`
  if (diffDays === 1) return 'Mañana'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date()
}

export function NotificationBell({ reminders }: Props) {
  const [open, setOpen] = useState(false)
  const hasActive = reminders.length > 0

  async function handleDelete(id: string) {
    await deleteReminder(id)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-muted"
        style={{ color: 'var(--muted-foreground)' }}
        aria-label="Notificaciones"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasActive && (
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: 'var(--destructive)' }}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-lg z-50 overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope)' }}>
                Recordatorios
              </p>
              {hasActive && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'oklch(from var(--destructive) l c h / 0.15)', color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}
                >
                  {reminders.length} activos
                </span>
              )}
            </div>

            {reminders.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                  Sin recordatorios activos
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                {reminders.map(r => (
                  <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: isOverdue(r.remind_at) ? 'var(--destructive)' : 'var(--primary)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-inter)' }}>{r.title}</p>
                      <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-inter)', color: isOverdue(r.remind_at) ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                        {formatRemindAt(r.remind_at)}
                      </p>
                      {r.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1" style={{ fontFamily: 'var(--font-inter)' }}>{r.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
