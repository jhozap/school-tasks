'use client'

import { useState, useRef, useEffect } from 'react'
import { createWorkspace, switchWorkspace, createInvitation, leaveWorkspace } from '@/app/(app)/workspace-actions'
import type { Workspace } from '@/types'

interface Props {
  workspaces: Workspace[]
  activeWorkspaceId: string
  isOwner: boolean
  userId: string
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function UserPlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId, isOwner, userId }: Props) {
  const [open, setOpen] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const active = workspaces.find(w => w.id === activeWorkspaceId) ?? workspaces[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowNewForm(false)
        setInviteUrl(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSwitch(id: string) {
    if (id === activeWorkspaceId) { setOpen(false); return }
    await switchWorkspace(id)
    setOpen(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    await createWorkspace(newName)
    setNewName('')
    setCreating(false)
    setShowNewForm(false)
    setOpen(false)
  }

  async function handleLeave(id: string) {
    setLeaving(true)
    await leaveWorkspace(id)
    setLeaving(false)
    setConfirmLeaveId(null)
    setOpen(false)
  }

  async function handleInvite() {
    setInviteLoading(true)
    const result = await createInvitation(activeWorkspaceId)
    setInviteLoading(false)
    if (result.error) return
    const url = `${window.location.origin}/join/${result.token}`
    setInviteUrl(url)
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); setInviteUrl(null) }}
        className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
        style={{ fontFamily: 'var(--font-manrope)' }}
      >
        <span className="truncate max-w-[160px]">{active?.name ?? 'Workspace'}</span>
        <ChevronIcon />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl z-50 overflow-hidden"
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px oklch(0.05 0 0 / 20%)',
          }}
        >
          <div className="p-2 space-y-0.5">
            {workspaces.map(ws => {
              const isMember = ws.created_by !== userId
              if (confirmLeaveId === ws.id) {
                return (
                  <div
                    key={ws.id}
                    className="rounded-xl px-3 py-2.5 space-y-2"
                    style={{
                      background: 'oklch(from var(--destructive) l c h / 0.08)',
                      border: '1px solid oklch(from var(--destructive) l c h / 0.2)',
                    }}
                  >
                    <p className="text-xs font-medium leading-snug" style={{ color: 'var(--destructive)', fontFamily: 'var(--font-inter)' }}>
                      ¿Abandonar &quot;{ws.name}&quot;?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmLeaveId(null)}
                        disabled={leaving}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ fontFamily: 'var(--font-inter)', background: 'var(--muted)', color: 'var(--foreground)' }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleLeave(ws.id)}
                        disabled={leaving}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'var(--destructive)',
                          color: '#fff',
                          fontFamily: 'var(--font-inter)',
                          opacity: leaving ? 0.6 : 1,
                        }}
                      >
                        {leaving ? 'Saliendo…' : 'Abandonar'}
                      </button>
                    </div>
                  </div>
                )
              }
              return (
                <div key={ws.id} className="flex items-center gap-1 group">
                  <button
                    onClick={() => handleSwitch(ws.id)}
                    className="flex-1 text-left px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-muted flex items-center justify-between"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspaceId && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--chart-3)' }} />
                    )}
                  </button>
                  {isMember && (
                    <button
                      onClick={() => setConfirmLeaveId(ws.id)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-muted"
                      style={{ color: 'var(--muted-foreground)' }}
                      title="Abandonar workspace"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="border-t mx-2" style={{ borderColor: 'var(--border)' }} />

          <div className="p-2 space-y-0.5">
            {showNewForm ? (
              <form onSubmit={handleCreate} className="px-1 py-1 space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Nombre del workspace"
                  autoFocus
                  className="w-full bg-muted rounded-lg px-3 py-2 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowNewForm(false); setNewName('') }}
                    className="flex-1 text-xs py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--cta-gradient-end) 100%)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-inter)' }}
                  >
                    {creating ? '...' : 'Crear'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <span className="text-base leading-none">+</span>
                <span>Nuevo workspace</span>
              </button>
            )}

            {isOwner && !showNewForm && (
              inviteUrl ? (
                <div className="px-1 py-1 space-y-2">
                  <p className="text-xs text-muted-foreground px-2" style={{ fontFamily: 'var(--font-inter)' }}>
                    Enlace de invitación (7 días):
                  </p>
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    onClick={e => (e.target as HTMLInputElement).select()}
                    className="w-full bg-muted rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-text"
                    style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--muted-foreground)', border: 'none' }}
                  />
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors"
                    style={{
                      background: copied ? 'oklch(from var(--chart-3) l c h / 0.15)' : 'oklch(from var(--primary) l c h / 0.12)',
                      color: copied ? 'var(--chart-3)' : 'var(--primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    <CopyIcon />
                    {copied ? '¡Copiado!' : 'Copiar enlace'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  <UserPlusIcon />
                  <span>{inviteLoading ? 'Generando...' : 'Invitar persona'}</span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
