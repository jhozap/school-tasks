'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ReminderModal } from '@/components/tasks/ReminderModal'
import type { Workspace } from '@/types'

function DashboardIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function UrgentIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CalendarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

interface Props {
  workspaces: Workspace[]
  activeWorkspaceId: string
  isOwner: boolean
  filter: string
}

export function Sidebar({ workspaces, activeWorkspaceId, isOwner, filter }: Props) {
  const router = useRouter()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [createExpanded, setCreateExpanded] = useState(false)

  const isCalendar = filter === 'calendar'

  const navItems = [
    { id: 'all', label: 'Dashboard', Icon: DashboardIcon },
    { id: 'urgent', label: 'Urgente', Icon: UrgentIcon },
    { id: 'calendar', label: 'Calendario', Icon: CalendarIcon },
  ]

  function handleNavClick(id: string) {
    if (id === 'calendar') {
      router.push('/calendar')
    } else {
      router.push(`/?filter=${id}`)
    }
  }

  function openTask() {
    setCreateExpanded(false)
    setShowTaskModal(true)
  }

  function openReminder() {
    setCreateExpanded(false)
    setShowReminderModal(true)
  }

  return (
    <>
      <aside
        className="hidden lg:flex flex-col w-72 flex-shrink-0 h-screen sticky top-0 overflow-y-auto"
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-base font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
            School Tasks
          </h1>
        </div>

        {/* Workspace switcher */}
        <div className="px-3 pb-4">
          <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            isOwner={isOwner}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ id, label, Icon }) => {
            const active = id === 'calendar' ? isCalendar : filter === id && !isCalendar
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: active ? 'oklch(from var(--primary) l c h / 0.12)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon filled={active} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Footer — expandable create button */}
        <div className="px-3 pb-6 mt-4 relative">
          {createExpanded && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCreateExpanded(false)} />
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
            onClick={() => setCreateExpanded(v => !v)}
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
              style={{ transform: createExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </aside>

      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {showReminderModal && <ReminderModal onClose={() => setShowReminderModal(false)} />}
    </>
  )
}
