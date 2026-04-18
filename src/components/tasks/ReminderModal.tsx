'use client'

import { useState } from 'react'
import { createReminder } from '@/app/(app)/reminder-actions'

interface Props {
  onClose: () => void
}

export function ReminderModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getDefaultDateTime() {
    const d = new Date()
    d.setHours(d.getHours() + 1, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await createReminder(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" style={{ backdropFilter: 'blur(8px)' }} />
      <div
        className="relative w-full sm:max-w-md bg-card sm:rounded-3xl rounded-t-3xl p-6 shadow-xl"
        style={{ boxShadow: '0 24px 64px oklch(0.05 0 0 / 32%)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(from var(--primary) l c h / 0.15)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
              Nuevo recordatorio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
              Título *
            </label>
            <input
              name="title"
              required
              autoFocus
              placeholder="¿Qué quieres recordar?"
              className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
              Fecha y hora *
            </label>
            <input
              name="remind_at"
              type="datetime-local"
              required
              defaultValue={getDefaultDateTime()}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none focus:ring-2 transition-shadow"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', border: 'none' }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-inter)' }}>
              Notas
            </label>
            <textarea
              name="notes"
              placeholder="Detalles adicionales..."
              rows={2}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ fontFamily: 'var(--font-inter)', border: 'none' }}
            />
          </div>

          {error && <p className="text-sm text-destructive" style={{ fontFamily: 'var(--font-inter)' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {loading ? 'Guardando...' : 'Crear recordatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
