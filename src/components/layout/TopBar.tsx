'use client'

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import Image from 'next/image'
import type { Reminder } from '@/types'

interface Props {
  userEmail: string
  userName: string
  avatarUrl: string
  pendingCount: number
  reminders: Reminder[]
}

function getInitials(name: string, email: string) {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  const local = email.split('@')[0]
  const parts = local.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

export function TopBar({ userEmail, userName, avatarUrl, pendingCount, reminders }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const initials = getInitials(userName, userEmail)
  const displayName = userName || userEmail
  const filter = pathname === '/calendar' ? 'calendar' : pathname === '/reminders' ? 'reminders' : (searchParams.get('filter') ?? 'all')
  const title = filter === 'urgent' ? 'Urgente' : filter === 'calendar' ? 'Calendario' : filter === 'reminders' ? 'Recordatorios' : 'Dashboard'

  return (
    <header
      className="hidden lg:flex items-center justify-between px-8 py-4 sticky top-0 z-30"
      style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="space-y-0.5">
        <h2
          className="text-lg font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          {title}
        </h2>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-inter)' }}>
          {pendingCount} pendientes
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell reminders={reminders} />

        <div className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-muted"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                  color: 'var(--primary-foreground)',
                }}
              >
                {initials}
              </div>
            )}
            <span className="text-sm text-muted-foreground max-w-[160px] truncate">
              {displayName}
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
              className="text-muted-foreground"
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-lg z-50 overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={displayName} width={36} height={36} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)',
                        color: 'var(--primary-foreground)',
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    {userName && (
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                        {userName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: 'var(--font-inter)' }}>
                      {userEmail}
                    </p>
                  </div>
                </div>
                <div className="p-2">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left"
                      style={{ fontFamily: 'var(--font-inter)', color: 'var(--destructive)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'oklch(from var(--destructive) l c h / 0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
