'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteWorkspace } from '@/app/(app)/workspace-actions'
import { WorkspaceDeleteConfirm } from './WorkspaceDeleteConfirm'
import type { Workspace } from '@/types'

interface Props {
  workspaces: Workspace[]
}

export function SidebarWorkspaceList({ workspaces }: Props) {
  const router = useRouter()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id: string) {
    setDeleting(true)
    await deleteWorkspace(id)
    setDeleting(false)
    setConfirmDeleteId(null)
    router.push('/')
  }

  return (
    <div className="px-3 pb-4 space-y-1.5">
      <p
        className="px-2 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-inter)' }}
      >
        Mis workspaces
      </p>
      {workspaces.map(ws => (
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
    </div>
  )
}
