'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { TaskInitialValues } from '@/components/tasks/TaskModal'

const TaskModal = dynamic(
  () => import('@/components/tasks/TaskModal').then(m => ({ default: m.TaskModal })),
  { ssr: false }
)

const ReminderModal = dynamic(
  () => import('@/components/tasks/ReminderModal').then(m => ({ default: m.ReminderModal })),
  { ssr: false }
)

const AICreateModal = dynamic(
  () => import('@/components/ai/AICreateModal').then(m => ({ default: m.AICreateModal })),
  { ssr: false }
)

const AIUpgradeBanner = dynamic(
  () => import('@/components/ai/AIUpgradeBanner').then(m => ({ default: m.AIUpgradeBanner })),
  { ssr: false }
)

interface Props {
  isPaid: boolean
}

export function SidebarCreateButton({ isPaid }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  const [taskInitialValues, setTaskInitialValues] = useState<TaskInitialValues | undefined>()

  function openTask() {
    setExpanded(false)
    setShowTaskModal(true)
  }

  function openReminder() {
    setExpanded(false)
    setShowReminderModal(true)
  }

  function openAI() {
    setExpanded(false)
    if (isPaid) setShowAIModal(true)
    else setShowUpgradeBanner(true)
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
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <button
                onClick={openAI}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted text-left"
                style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)', opacity: isPaid ? 1 : 0.6 }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isPaid ? 'linear-gradient(135deg, #7c3aed33 0%, #4f46e533 100%)' : 'var(--muted)',
                    color: isPaid ? '#7c3aed' : 'var(--muted-foreground)',
                  }}
                >
                  {isPaid ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z" />
                      <path d="M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6Z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </span>
                <div>
                  <p className="font-medium text-sm">Crear con IA</p>
                  <p className="text-xs text-muted-foreground">
                    {isPaid ? 'Desde imagen o audio' : 'Función premium'}
                  </p>
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

      {showTaskModal && (
        <TaskModal
          initialValues={taskInitialValues}
          onClose={() => { setShowTaskModal(false); setTaskInitialValues(undefined) }}
        />
      )}
      {showReminderModal && <ReminderModal onClose={() => setShowReminderModal(false)} />}
      {showAIModal && (
        <AICreateModal
          onClose={() => setShowAIModal(false)}
          onExtracted={fields => {
            setTaskInitialValues(fields)
            setShowTaskModal(true)
          }}
        />
      )}
      {showUpgradeBanner && <AIUpgradeBanner onClose={() => setShowUpgradeBanner(false)} />}
    </>
  )
}
