import Link from 'next/link'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { SidebarCreateButton } from './SidebarClient'
import { SidebarWorkspaceList } from './SidebarWorkspaceList'
import type { Workspace } from '@/types'

export type ActiveNav = 'all' | 'urgent' | 'calendar' | 'reminders'

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

function BellIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

const navItems = [
  { id: 'all' as ActiveNav, label: 'Dashboard', Icon: DashboardIcon, href: '/?filter=all' },
  { id: 'urgent' as ActiveNav, label: 'Urgente', Icon: UrgentIcon, href: '/?filter=urgent' },
  { id: 'calendar' as ActiveNav, label: 'Calendario', Icon: CalendarIcon, href: '/calendar' },
  { id: 'reminders' as ActiveNav, label: 'Recordatorios', Icon: BellIcon, href: '/reminders' },
]

interface Props {
  workspaces: Workspace[]
  activeWorkspaceId: string
  userId: string
  isOwner: boolean
  activeNav: ActiveNav
}

export function Sidebar({ workspaces, activeWorkspaceId, userId, isOwner, activeNav }: Props) {
  const ownedWorkspaces = workspaces.filter(w => w.created_by === userId)

  return (
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
        {navItems.map(({ id, label, Icon, href }) => {
          const active = activeNav === id
          return (
            <Link
              key={id}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                fontFamily: 'var(--font-inter)',
                background: active ? 'oklch(from var(--primary) l c h / 0.12)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon filled={active} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Owned workspaces — delete section */}
      {ownedWorkspaces.length > 0 && (
        <SidebarWorkspaceList workspaces={ownedWorkspaces} />
      )}

      {/* Footer — expandable create button */}
      <SidebarCreateButton />
    </aside>
  )
}
