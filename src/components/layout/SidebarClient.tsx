'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const TaskModal = dynamic(
  () => import('@/components/tasks/TaskModal').then(m => ({ default: m.TaskModal })),
  { ssr: false }
)

const ReminderModal = dynamic(
  () => import('@/components/tasks/ReminderModal').then(m => ({ default: m.ReminderModal })),
  { ssr: false }
)

export function SidebarCreateButton() {
  const [expanded, setExpanded] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)

  function openTask() {
    setExpanded(false)
    setShowTaskModal(true)
  }

  function openReminder() {
    setExpanded(false)
    setShowReminderModal(true)
  }

  return (
    <>
      <div className="px-3 pb-6 mt-4 relative">
        {expanded && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
            <div
              className="absolute bottom-full mb-2 left-0 right-0 mx-3 rounded-2xl overflow-hidden z-50 shadow-lg"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={openTask}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted text-left"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'oklch(from var(--primary) l c h / 0.15)', color: 'var(--primary)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-sm">Nueva tarea</p>
                  <p className="text-xs text-muted-foreground">Crear una tarea nueva</p>
                </div>
              </button>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <button
                onClick={openReminder}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted text-left"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'oklch(from var(--destructive) l c h / 0.15)', color: 'var(--destructive)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-sm">Nuevo recordatorio</p>
                  <p className="text-xs text-muted-foreground">Recibir una alerta</p>
                </div>
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">+</span>
            Crear nuevo
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {showReminderModal && <ReminderModal onClose={() => setShowReminderModal(false)} />}
    </>
  )
}
