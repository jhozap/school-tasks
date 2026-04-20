'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteWorkspace, leaveWorkspace } from '@/app/(app)/workspace-actions'
import { WorkspaceDeleteConfirm } from './WorkspaceDeleteConfirm'
import type { Workspace } from '@/types'

interface Props {
  ownedWorkspaces: Workspace[]
  memberWorkspaces: Workspace[]
}

function LogOutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function SidebarWorkspaceList({ ownedWorkspaces, memberWorkspaces }: Props) {
  const router = useRouter()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  async function handleDelete(id: string) {
    setDeleting(true)
    await deleteWorkspace(id)
    setDeleting(false)
    setConfirmDeleteId(null)
    router.push('/')
  }

  async function handleLeave(id: string) {
    setLeaving(true)
    await leaveWorkspace(id)
    setLeaving(false)
    setConfirmLeaveId(null)
    router.push('/')
  }

  return (
    <div className="px-3 pb-4 space-y-1.5">
      {ownedWorkspaces.length > 0 && (
        <>
          <p
            className="px-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
          >
            Mis workspaces
          </p>
          {ownedWorkspaces.map(ws => (
            <div key={ws.id}>
              {confirmDeleteId === ws.id ? (
                <WorkspaceDeleteConfirm
                  name={ws.name}
                  deleting={deleting}
                  onCancel={() => setConfirmDeleteId(null)}
                  onConfirm={() => handleDelete(ws.id)}
                />
              ) : (
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl group"
                  style={{ background: 'transparent' }}
                >
                  <span
                    className="flex-1 text-sm truncate"
                    style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
                  >
                    {ws.name}
                  </span>
                  <button
                    onClick={() => setConfirmDeleteId(ws.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                    style={{ color: 'var(--destructive)' }}
                    title="Eliminar workspace"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </>
      )}

      {memberWorkspaces.length > 0 && (
        <>
          <p
            className="px-2 text-[11px] font-semibold uppercase tracking-wider mt-2"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
          >
            Invitado a
          </p>
          {memberWorkspaces.map(ws => (
            <div key={ws.id}>
              {confirmLeaveId === ws.id ? (
                <div
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
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
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
              ) : (
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl group"
                  style={{ background: 'transparent' }}
                >
                  <span
                    className="flex-1 text-sm truncate"
                    style={{ fontFamily: 'var(--font-inter)', color: 'var(--foreground)' }}
                  >
                    {ws.name}
                  </span>
                  <button
                    onClick={() => setConfirmLeaveId(ws.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Abandonar workspace"
                  >
                    <LogOutIcon />
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
