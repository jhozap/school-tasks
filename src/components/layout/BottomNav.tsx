'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/login/actions'
import type { Workspace } from '@/types'

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
  workspaces: Workspace[]
  activeWorkspaceId: string
}

export function BottomNav({ userEmail, workspaces, activeWorkspaceId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') ?? 'all'
  const [showProfile, setShowProfile] = useState(false)

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)

  function navigate(f: string) {
    router.push(`/?filter=${f}`)
  }

  const tabs = [
    { id: 'all', label: 'Home', icon: HomeIcon },
    { id: 'urgent', label: 'Urgente', icon: UrgentIcon },
  ]

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          background: 'var(--card)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center max-w-2xl mx-auto">
          {tabs.map(tab => {
            const active = filter === tab.id
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
    </>
  )
}
