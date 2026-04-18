'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { TaskModal } from '@/components/tasks/TaskModal'
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


interface Props {
  workspaces: Workspace[]
  activeWorkspaceId: string
  isOwner: boolean
  filter: string
}

export function Sidebar({ workspaces, activeWorkspaceId, isOwner, filter }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const navItems = [
    { id: 'all', label: 'Dashboard', Icon: DashboardIcon },
    { id: 'urgent', label: 'Urgente', Icon: UrgentIcon },
  ]

  return (
    <>
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 min-h-screen sticky top-0"
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
            const active = filter === id
            return (
              <button
                key={id}
                onClick={() => router.push(`/?filter=${id}`)}
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

        {/* Footer */}
        <div className="px-3 pb-6 space-y-2 mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            <span className="text-lg leading-none">+</span>
            Nueva tarea
          </button>

        </div>
      </aside>

      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
    </>
  )
}
