'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { logout } from '@/app/login/actions'
import { deleteWorkspace } from '@/app/(app)/workspace-actions'
import dynamic from 'next/dynamic'
import { WorkspaceDeleteConfirm } from './WorkspaceDeleteConfirm'
import type { Workspace } from '@/types'

const TaskModal = dynamic(() => import('@/components/tasks/TaskModal').then(m => m.TaskModal))
const ReminderModal = dynamic(() => import('@/components/tasks/ReminderModal').then(m => m.ReminderModal))

function HomeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function UrgentIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CalendarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ProfileIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

interface Props {
  userEmail: string
  userId: string
  workspaces: Workspace[]
  activeWorkspaceId: string
  remindersCount: number
}

export function BottomNav({ userEmail, userId, workspaces, activeWorkspaceId, remindersCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const filter = searchParams.get('filter') ?? 'all'
  const [showProfile, setShowProfile] = useState(false)
  const [fabExpanded, setFabExpanded] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)
  const isCalendar = pathname === '/calendar'
  const ownedWorkspaces = workspaces.filter(w => w.created_by === userId)

  async function handleDeleteWorkspace(id: string) {
    setDeleting(true)
    await deleteWorkspace(id)
    setDeleting(false)
    setConfirmDeleteId(null)
    setShowProfile(false)
    router.push('/')
  }

  useEffect(() => {
    router.prefetch('/calendar')
    router.prefetch('/reminders')
    router.prefetch('/?filter=all')
    router.prefetch('/?filter=urgent')
  }, [router])

  function navigate(f: string) {
    startTransition(() => router.push(`/?filter=${f}`))
  }

  function openTask() {
    setFabExpanded(false)
    setShowTaskModal(true)
  }

  function openReminder() {
    setFabExpanded(false)
    setShowReminderModal(true)
  }

  const leftTabs = [
    { id: 'all', label: 'Home', icon: HomeIcon },
    { id: 'urgent', label: 'Urgente', icon: UrgentIcon },
  ]

  const rightTabs = [
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
  ]

  return (
    <>
      {/* FAB expanded overlay */}
      {fabExpanded && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setFabExpanded(false)}>
          <div className="absolute inset-0 bg-black/20" style={{ backdropFilter: 'blur(4px)' }} />
        </div>
      )}

      {/* FAB option bubbles */}
      {fabExpanded && (
        <div className="fixed bottom-20 left-0 right-0 z-50 lg:hidden flex justify-center gap-4 px-8">
          <button
            onClick={openTask}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                color: 'var(--primary-foreground)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}>
              Nueva tarea
            </span>
          </button>

          <button
            onClick={openReminder}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'var(--destructive)', color: '#fff' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </span>
            <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}>
              Recordatorio
            </span>
          </button>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          background: 'var(--card)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center max-w-2xl mx-auto">
          {/* Left tabs */}
          {leftTabs.map(tab => {
            const active = !isCalendar && filter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
              >
                <tab.icon filled={active} />
                <span className="text-[10px] font-medium tracking-wide uppercase">{tab.label}</span>
              </button>
            )
          })}

          {/* Center FAB */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setFabExpanded(v => !v)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all"
              style={{
                background: fabExpanded
                  ? 'var(--muted-foreground)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                color: 'var(--primary-foreground)',
                transform: fabExpanded ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.2s, background 0.2s',
              }}
              aria-label="Crear nuevo"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Right tabs */}
          {rightTabs.map(tab => {
            const active = isCalendar
            return (
              <button
                key={tab.id}
                onClick={() => startTransition(() => router.push('/calendar'))}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
              >
                <tab.icon filled={active} />
                <span className="text-[10px] font-medium tracking-wide uppercase">{tab.label}</span>
              </button>
            )
          })}

          {/* Profile tab */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            style={{ color: showProfile ? 'var(--primary)' : 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
          >
            <ProfileIcon filled={showProfile} />
            <span className="text-[10px] font-medium tracking-wide uppercase">Perfil</span>
          </button>
        </div>
      </nav>

      {showProfile && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end"
          onClick={() => setShowProfile(false)}
        >
          <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(8px)' }} />
          <div
            className="relative w-full rounded-t-3xl p-6 space-y-5"
            style={{ background: 'var(--card)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-2" />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)' }}>
                Workspace activo
              </p>
              <p className="text-base font-bold" style={{ fontFamily: 'var(--font-manrope)' }}>
                {activeWorkspace?.name ?? 'Sin workspace'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)' }}>
                Cuenta
              </p>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
                {userEmail}
              </p>
            </div>

            {ownedWorkspaces.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter)' }}>
                  Mis workspaces
                </p>
                <div className="space-y-1">
                  {ownedWorkspaces.map(ws => (
                    <div key={ws.id}>
                      {confirmDeleteId === ws.id ? (
                        <WorkspaceDeleteConfirm
                          name={ws.name}
                          deleting={deleting}
                          onCancel={() => setConfirmDeleteId(null)}
                          onConfirm={() => handleDeleteWorkspace(ws.id)}
                        />
                      ) : (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl transition-colors" style={{ background: 'var(--muted)' }}>
                          <span className="text-sm font-medium truncate flex-1" style={{ fontFamily: 'var(--font-inter)' }}>
                            {ws.name}
                          </span>
                          <button
                            onClick={() => setConfirmDeleteId(ws.id)}
                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-destructive/10"
                            style={{ color: 'var(--destructive)' }}
                            title="Eliminar workspace"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form action={logout} className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl text-sm font-semibold text-destructive bg-muted hover:bg-destructive/10 transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {showReminderModal && <ReminderModal onClose={() => setShowReminderModal(false)} />}
    </>
  )
}
