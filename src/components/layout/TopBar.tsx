import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { TopBarUserMenu } from './TopBarUserMenu'
import type { ActiveNav } from './Sidebar'
import type { Reminder } from '@/types'

const titleMap: Record<ActiveNav, string> = {
  all: 'Dashboard',
  urgent: 'Urgente',
  calendar: 'Calendario',
  reminders: 'Recordatorios',
}

interface Props {
  userEmail: string
  userName: string
  avatarUrl: string
  reminders: Reminder[]
  activeNav: ActiveNav
}

export function TopBar({ userEmail, userName, avatarUrl, reminders, activeNav }: Props) {
  const title = titleMap[activeNav]

  return (
    <header
      className="hidden lg:flex items-center justify-between px-8 py-4 sticky top-0 z-30"
      style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
    >
      <h2
        className="text-lg font-extrabold tracking-tight"
        style={{ fontFamily: 'var(--font-manrope)' }}
      >
        {title}
      </h2>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell reminders={reminders} />
        <TopBarUserMenu userEmail={userEmail} userName={userName} avatarUrl={avatarUrl} />
      </div>
    </header>
  )
}
